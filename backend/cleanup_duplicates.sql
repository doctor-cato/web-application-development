-- Đổi tên các email bị trùng lặp (giữ lại tài khoản tạo mới nhất)
WITH EmailCTE AS (
    SELECT user_id, email,
           ROW_NUMBER() OVER(PARTITION BY email ORDER BY created_at DESC) as rn
    FROM users
)
UPDATE EmailCTE 
SET email = email + '.dup' + CAST(rn AS VARCHAR)
WHERE rn > 1;

-- Đổi tên các số điện thoại bị trùng lặp (nếu có và không rỗng)
WITH PhoneCTE AS (
    SELECT user_id, phone_number,
           ROW_NUMBER() OVER(PARTITION BY phone_number ORDER BY created_at DESC) as rn
    FROM users
    WHERE phone_number IS NOT NULL AND phone_number <> ''
)
UPDATE PhoneCTE 
SET phone_number = phone_number + '.dup' + CAST(rn AS VARCHAR)
WHERE rn > 1;
