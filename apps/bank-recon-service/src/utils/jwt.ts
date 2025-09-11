import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mistake2602';
const EXPIRES_IN = process.env.EXPIRES_IN || '1h';

export function generateToken(payload: object): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): { valid: boolean; decoded?: any; error?: any } {
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		return { valid: true, decoded };
	} catch (error) {
		return { valid: false, error };
	}
}
