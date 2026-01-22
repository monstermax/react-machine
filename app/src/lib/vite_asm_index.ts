
import type { Plugin } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Plugin Vite ultra-simple pour générer la liste des fichiers ASM
 */
export function asmDirectoryPlugin(): Plugin {
    return {
        name: 'vite-plugin-asm-directory',

        buildStart() {
            const asmPath = './public/asm';
            const outputPath = './public/asm-files.json';

            // Vérifie si le dossier existe
            if (!fs.existsSync(asmPath)) {
                console.log('ℹ️  Dossier ASM non trouvé, skip génération JSON');
                return;
            }

            try {
                // Utilise find pour lister tous les fichiers
                const command = `find "${asmPath}" -type f -name "*.asm"`;
                const output = execSync(command).toString();

                // Nettoie les chemins
                const files = output
                    .trim()
                    .split('\n')
                    .filter(Boolean)
                    .map(file => file.replace(`${asmPath}/`, ''))
                    .filter(file => file.length > 0);

                // Écrit le JSON
                const result = {
                    generated: new Date().toISOString(),
                    count: files.length,
                    files
                };

                fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
                console.log(`✅ ${files.length} fichiers ASM listés dans ${outputPath}`);

            } catch (error: any) {
                console.log('⚠️  Erreur lors de la génération:', error.message);
            }
        }
    };
}

