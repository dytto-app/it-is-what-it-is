-- Add free cosmetics to drive engagement (parent: #60, subtask: #63, #66)
-- Mix of free and paid creates a clear upgrade path

INSERT INTO public.cosmetics (id, name, type, price) VALUES
-- Free Frames
('clean', 'Clean Look', 'frame', 0),
('neon', 'Neon Green', 'frame', 0),
-- Free Badges
('newbie', 'Newbie', 'badge', 0),
('veteran', 'Veteran', 'badge', 0),
-- Free Titles
('enthusiast', 'Bathroom Enthusiast', 'title', 0),
('breaker', 'Break Taker', 'title', 0)
ON CONFLICT (id) DO NOTHING;
