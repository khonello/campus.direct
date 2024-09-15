// tiles for window. 3x3
// tile size 256x256
let urls = []
let center_tile = [9, 6]
let mask = []
let tiles = []

// for (let i = 0; i < 3; i++) {
//     for (let j = 0; j < 3; j++) {
//         tiles = [...tiles, [(j - 1) + 9, (i - 1) + 6]]

//     }
// }

// [
//     [8,   5], [9,  5], [10,  5],
//     [8,   6], [9,  6], [10,  6],
//     [8,   7], [9,  7], [10,  7]
// ]

// [
//     [-1, -1], [0, -1], [1,  -1],                    // this mask applied to the center tile [9, 6] gives the neighboring tiles
//     [-1,  0], [0,  0], [1,   0],
//     [-1,  1], [0,  1], [1,   1]
// ]

// for (let i = 0; i < 3; i++) {
//     for (let j = 0; j < 3; j++) {

//         [j - 1, i - 1]                              // we are generating the mask
//     }
// }

for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 11; j++) {
        tiles = [...tiles, [(j - 1) + 32720, (i - 1) + 31662]]

    }
}

tiles.forEach((tile) => {
    urls = [...urls, `https://tile.openstreetmap.org/16/${tile[0]}/${tile[1]}.png`]
})

console.log(urls)