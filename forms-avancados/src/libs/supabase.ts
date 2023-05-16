import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://rztpzpyecmenkwbutvkq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dHB6cHllY21lbmt3YnV0dmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDAyNDE3NSwiZXhwIjoxOTk5NjAwMTc1fQ.yYx6wb2JQzJOjDhzFqTYm0TNJdHvPi4xcjKnZPRumyE'
)