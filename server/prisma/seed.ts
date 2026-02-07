import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin', 10);

    // Ensure Ranks exist
    const ranks = [
        { name: 'Cadet', weight: 1 },
        { name: 'Agent', weight: 2 },
        { name: 'Special Agent', weight: 3 },
        { name: 'Director', weight: 10 },
    ];

    for (const r of ranks) {
        await prisma.rank.upsert({
            where: { id: r.weight }, // Hack: using weight as ID for simplicity or check logic
            update: {},
            create: {
                id: r.weight,
                name: r.name,
                weight: r.weight
            }
        });
    }

    // Ensure Departments exist
    const depts = [
        { id: 1, name: 'Academy' },
        { id: 2, name: 'Headquarters' },
    ];
    for (const d of depts) {
        await prisma.department.upsert({
            where: { id: d.id },
            update: {},
            create: { id: d.id, name: d.name } // Corrected: passing scalar values, not object for relation
        });
    }

    const admin = await prisma.user.upsert({
        where: { staticId: '#1' },
        update: {
            departmentId: 2 // Headquarters
        }, // Update department on re-seed
        create: {
            staticId: '#1',
            nickname: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            rankId: 10, // Director
            departmentId: 2 // Headquarters
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
