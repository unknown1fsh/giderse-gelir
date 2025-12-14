-- Add username column to user table
ALTER TABLE "user" ADD COLUMN "username" VARCHAR(50);

-- Make name column nullable
ALTER TABLE "user" ALTER COLUMN "name" DROP NOT NULL;

-- Generate usernames for existing users
-- First, try to create username from email (before @)
UPDATE "user" 
SET "username" = LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-z0-9_]', '_', 'g'))
WHERE "username" IS NULL;

-- For users where email-based username might be empty or invalid, use user_{id} format
UPDATE "user"
SET "username" = 'user_' || id::text
WHERE "username" IS NULL OR LENGTH("username") < 3;

-- Ensure all usernames are unique by appending id if needed
-- This handles cases where multiple users might have same email prefix
DO $$
DECLARE
    user_record RECORD;
    base_username VARCHAR(50);
    final_username VARCHAR(50);
    counter INTEGER;
BEGIN
    FOR user_record IN SELECT id, username FROM "user" ORDER BY id LOOP
        base_username := user_record.username;
        final_username := base_username;
        counter := 1;
        
        -- Check if username already exists (excluding current user)
        WHILE EXISTS (SELECT 1 FROM "user" WHERE username = final_username AND id != user_record.id) LOOP
            final_username := base_username || '_' || counter::text;
            counter := counter + 1;
            
            -- Prevent infinite loop, fallback to user_{id}
            IF counter > 1000 THEN
                final_username := 'user_' || user_record.id::text;
                EXIT;
            END IF;
        END LOOP;
        
        -- Update if changed
        IF final_username != base_username THEN
            UPDATE "user" SET username = final_username WHERE id = user_record.id;
        END IF;
    END LOOP;
END $$;

-- Add unique constraint and NOT NULL constraint
ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
