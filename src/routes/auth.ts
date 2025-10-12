import express, { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/db.js';
import { usersTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Tipado para las requests
interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    console.log('\n===== INICIO LOGIN =====');
    console.log('📥 Body recibido (login):', JSON.stringify(req.body, null, 2));

    try {
        const { email, password } = req.body;

        console.log('🔍 Validando email y password...');

        // Validación básica
        if (!email || !password) {
            console.log('❌ Falta email o password');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        console.log('✅ Email y password presentes');

        console.log('🔍 Buscando usuario por email:', email.toLowerCase().trim());

        // Buscar usuario por email
        const users = await db.select()
            .from(usersTable)
            .where(eq(usersTable.email, email.toLowerCase().trim()))
            .limit(1);

        console.log('   - Usuarios encontrados:', users.length);

        // Si no se encuentra el usuario
        if (users.length === 0) {
            console.log('❌ Usuario no encontrado para email:', email.toLowerCase().trim());
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
        }

        const foundUser = users[0]!;
        console.log('✅ Usuario encontrado. id:', foundUser.id);

        console.log('🔐 Verificando contraseña (bcrypt.compare)...');

        // Verificamos la contraseña
        const isPasswordValid = await bcrypt.compare(password, foundUser.password); // false

        console.log('   - Resultado bcrypt.compare:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('❌ Contraseña inválida para usuario id:', foundUser.id);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
        }

        console.log('🔑 Generando JWT token...');

        // Generar JWT token
        const token = jwt.sign(
            {
                userId: foundUser.id,
                email: foundUser.email,
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        console.log('   - Token generado (primeros 20 chars):', token.slice(0, 20) + '...');

        // Respuesta exitosa (sin incluir password)
        const userResponse = {
            id: foundUser.id.toString(),
            name: foundUser.name,
            email: foundUser.email,
            phone: foundUser.phone,
            profileImg: foundUser.profile_img,
            createdAt: foundUser.created_at?.toISOString(),
            updatedAt: foundUser.updated_at?.toISOString(),
        };

        console.log('✅ Preparando respuesta de login para usuario id:', foundUser.id);

        res.status(200).json({
            success: true,
            data: {
                user: userResponse,
                token: token
            },
            message: 'Login exitoso'
        });

        console.log('🎉 Login exitoso enviado para usuario id:', foundUser.id);

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

router.post('/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {

    console.log('\n========== INICIO REGISTRO ==========');
    console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));

    try {
        const { name, email, password, phone } = req.body;

        // Validaciones básicas
        console.log('🔍 Validando campos requeridos...');
        if (!name || !email || !password) {
            console.log('❌ Validación falló: campos faltantes');
            console.log('   - name:', name ? '✓' : '✗');
            console.log('   - email:', email ? '✓' : '✗');
            console.log('   - password:', password ? '✓' : '✗');

            return res.status(400).json({
                success: false,
                message: 'Nombre, email y contraseña son requeridos'
            });
        }
        console.log('✅ Campos requeridos presentes');

        // Validar longitud de contraseña
        console.log('🔍 Validando longitud de contraseña...');
        console.log('   - Longitud recibida:', password.length);
        if (password.length < 8) {
            console.log('❌ Contraseña muy corta');
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }
        console.log('✅ Contraseña válida');

        // Verificar si el email ya existe
        console.log('🔍 Verificando si el email ya existe...');
        console.log('   - Email a buscar:', email.toLowerCase().trim());
        const existingUsers = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);

        console.log('   - Usuarios encontrados:', existingUsers.length);

        if (existingUsers.length > 0) {
            console.log('❌ Email ya registrado:', email.toLowerCase().trim());
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }
        console.log('✅ Email disponible');

        console.log('🔐 Hasheando la contraseña...');

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log('   - Hash generado (primeros 20 chars):', hashedPassword.slice(0, 20) + '...');

        // Crear nuevo usuario
        console.log('💾 Insertando usuario en la base de datos...');
        const newUsers = await db.insert(usersTable).values({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone?.trim() || null,
            created_at: new Date(),
            updated_at: new Date()
        }).returning();

        console.log('   - Resultado insert:', newUsers.length, 'registro(s)');

        const newUser = newUsers[0]!;

        console.log('✅ Usuario creado. id:', newUser.id);

        console.log('🔑 Generando token para nuevo usuario...');

        // Generar token
        const token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        console.log('   - Token generado (primeros 20 chars):', token.slice(0, 20) + '...');


        // Respuesta
        const userResponse = {
            id: newUser.id.toString(),
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            profileImg: newUser.profile_img,
            createdAt: newUser.created_at?.toISOString(),
            updatedAt: newUser.updated_at?.toISOString()
        };

        console.log('✅ Preparando respuesta de registro para usuario id:', newUser.id);

        res.status(201).json({
            success: true,
            data: {
                user: userResponse,
                token: token
            },
            message: 'Usuario Resitrado Exitosamente'
        });

        console.log('🎉 Registro exitoso enviado para usuario id:', newUser.id);

    } catch (e) {
        console.error('Register error', e);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Middleware para verificar token (para rutas protegidas)
export const authenticateToken = (req: any, res: Response, next: any) => {
    console.log('🔒 authenticateToken: verificando header Authorization');

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.log('❌ authenticateToken: token no proporcionado');

        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
        if (err) {
            console.log('❌ authenticateToken: token inválido o expirado', err);

            return res.status(403).json({
                success: false,
                message: 'Token inválido'
            });
        }
        console.log('✅ authenticateToken: token válido. user:', user);
        req.user = user;
        next();
    });
};

export default router;