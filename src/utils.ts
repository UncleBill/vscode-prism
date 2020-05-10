export function calculatePath (path: string) : number {
    let sum = 0;
    for (let index = 0; index < path.length; index++) {
        sum += path.charCodeAt(index);
    }
    return sum;
}