import bcrypt from 'bcryptjs'

export async function hashPassword(plain) {
  if (!plain) return null
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}

export async function verifyPassword(plain, hash) {
  if (!plain || !hash) return false
  return bcrypt.compare(plain, hash)
}
