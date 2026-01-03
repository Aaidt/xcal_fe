
export function hashFunction(): string {
    const char = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890"
    let hash = "";
    const length = char.length;
    for (let i = 0; i < length; i++) {
        hash += char[Math.floor(Math.random() * length)]
    }
    return hash
}
