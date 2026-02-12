

export function toHex(intValue: i32, padleft: i32 = 0): string {
    // Tableau de conversion hexadécimale
    const hexChars = "0123456789ABCDEF";
    let result = "";

    //if (1) return intValue.toString();

    // Gérer le cas de 0
    if (intValue === 0) {
        result = "0";

    } else {
        // Convertir en hexadécimal
        let n = intValue;
        while (n > 0) {
            const remainder = n % 16 as i32;
            result = hexChars.charAt(remainder) + result;
            n = Math.round(n / 16) as i32;
        }
    }

    // Ajouter un zéro devant si la longueur est impaire
    if (result.length % 2 === 1) {
        result = "0" + result;
    }

    // Remplir à gauche si nécessaire
    if (padleft > 0 && result.length < padleft) {
        while (result.length < padleft) {
            result = "0" + result;
        }
    }

    return "0x" + result;
}



export function high16(value: u16): u8 {
    return value >> 8;
}

export function low16(value: u16): u8 {
    return value & 0xFF;
}
