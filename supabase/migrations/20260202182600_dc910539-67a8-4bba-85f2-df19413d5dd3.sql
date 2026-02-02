-- Drop the overly permissive INSERT policy for reviews
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;

-- Create a more secure INSERT policy that links reviews to the authenticated user
CREATE POLICY "Authenticated users can insert their own reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);