import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

/**
 * Password Reset Edge Function
 * 
 * Handles password reset for backlog users who use fake emails for auth.
 * Requires users to have a recovery_email set in their profile.
 * 
 * Endpoints:
 * - POST /request - Request password reset (sends email)
 * - POST /verify - Verify a token is valid
 * - POST /reset - Reset password with valid token
 */

const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const resendApiKey = Deno.env.get("RESEND_API_KEY") || ""

const SITE_URL = "https://back-log.com"
const TOKEN_EXPIRY_HOURS = 1

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function generateSecureToken(): Promise<string> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function sendResetEmail(email: string, token: string, username: string): Promise<boolean> {
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured")
    return false
  }

  const resetUrl = `${SITE_URL}/reset-password?token=${token}`
  
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Backlog <noreply@back-log.com>",
        to: [email],
        subject: "Reset your Backlog password",
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1; margin-bottom: 20px;">Password Reset Request</h1>
            <p style="color: #334155; font-size: 16px;">Hey ${username},</p>
            <p style="color: #334155; font-size: 16px;">
              We received a request to reset your Backlog password. Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #6366f1, #a855f7); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Reset Password
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              This link will expire in ${TOKEN_EXPIRY_HOURS} hour. If you didn't request this reset, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">
              Backlog — Track your time, earn your worth.
            </p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error("Resend API error:", error)
      return false
    }
    return true
  } catch (err) {
    console.error("Failed to send email:", err)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const url = new URL(req.url)
  const action = url.pathname.split("/").pop()

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const body = await req.json()

    // REQUEST: User submits username to request password reset
    if (action === "request") {
      const { username } = body

      if (!username) {
        return new Response(JSON.stringify({ error: "Username is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const sanitizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')

      // Find user by looking up profiles with matching auth user
      // First try the new email format, then legacy
      const emailVariants = [
        `${sanitizedUsername}@backlog-app.internal`,
        `${sanitizedUsername}@example.com`,
      ]

      let userId: string | null = null
      let recoveryEmail: string | null = null
      let displayName: string = sanitizedUsername

      // Find user in auth.users
      for (const email of emailVariants) {
        const { data: userData } = await supabase.auth.admin.listUsers()
        const user = userData?.users?.find(u => u.email === email)
        if (user) {
          userId = user.id
          break
        }
      }

      if (!userId) {
        // Don't reveal if user exists or not for security
        return new Response(JSON.stringify({ 
          success: true, 
          message: "If an account with that username exists and has a recovery email, you'll receive a reset link." 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Get profile with recovery email
      const { data: profile } = await supabase
        .from("profiles")
        .select("recovery_email, nickname")
        .eq("id", userId)
        .single()

      recoveryEmail = profile?.recovery_email
      displayName = profile?.nickname || sanitizedUsername

      if (!recoveryEmail) {
        // Same response to not leak user existence
        return new Response(JSON.stringify({ 
          success: true, 
          message: "If an account with that username exists and has a recovery email, you'll receive a reset link." 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Generate token and store it
      const token = await generateSecureToken()
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

      // Invalidate any existing tokens for this user
      await supabase
        .from("password_reset_tokens")
        .delete()
        .eq("user_id", userId)

      const { error: insertError } = await supabase
        .from("password_reset_tokens")
        .insert({
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString(),
        })

      if (insertError) {
        console.error("Failed to store token:", insertError)
        return new Response(JSON.stringify({ error: "Failed to process request" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Send email
      const emailSent = await sendResetEmail(recoveryEmail, token, displayName)
      if (!emailSent) {
        console.error("Failed to send reset email")
        // Still return success to not leak info
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "If an account with that username exists and has a recovery email, you'll receive a reset link." 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // VERIFY: Check if a token is valid (before showing reset form)
    if (action === "verify") {
      const { token } = body

      if (!token) {
        return new Response(JSON.stringify({ valid: false, error: "Token is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { data: tokenData } = await supabase
        .from("password_reset_tokens")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single()

      return new Response(JSON.stringify({ valid: !!tokenData }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // RESET: Actually reset the password
    if (action === "reset") {
      const { token, password } = body

      if (!token || !password) {
        return new Response(JSON.stringify({ error: "Token and password are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      if (password.length < 6) {
        return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Find valid token
      const { data: tokenData, error: tokenError } = await supabase
        .from("password_reset_tokens")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single()

      if (tokenError || !tokenData) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Update password using admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        tokenData.user_id,
        { password }
      )

      if (updateError) {
        console.error("Failed to update password:", updateError)
        return new Response(JSON.stringify({ error: "Failed to reset password" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Mark token as used
      await supabase
        .from("password_reset_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", tokenData.id)

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Password has been reset. You can now sign in." 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error("Error:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
