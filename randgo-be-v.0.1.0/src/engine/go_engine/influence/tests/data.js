exports.finished = [
    [0,0,0,-1,-1,-1,1,0,1,1,-1,-1,0,-1,0,-1,-1,1,0],
    [0,0,-1,0,-1,1,1,1,0,1,-1,0,-1,-1,-1,-1,1,1,0],
    [0,0,-1,-1,-1,1,1,0,0,1,1,-1,-1,1,-1,1,0,1,0],
    [0,0,0,0,-1,-1,1,0,1,-1,1,1,1,1,1,0,1,0,0],
    [0,0,0,0,-1,0,-1,1,0,0,1,1,0,0,0,1,1,1,0],
    [0,0,-1,0,0,-1,-1,1,0,-1,-1,1,-1,-1,0,1,0,0,1],
    [0,0,0,-1,-1,1,1,1,1,1,1,1,1,-1,-1,-1,1,1,1],
    [0,0,-1,1,1,0,1,-1,-1,1,0,1,-1,0,1,-1,-1,-1,1],
    [0,0,-1,-1,1,1,1,0,-1,1,-1,-1,0,-1,-1,1,1,1,1],
    [0,0,-1,1,1,-1,-1,-1,-1,1,1,1,-1,-1,-1,-1,1,-1,-1],
    [-1,-1,-1,-1,1,1,1,-1,0,-1,1,-1,-1,0,-1,1,1,-1,0],
    [-1,1,-1,0,-1,-1,-1,-1,-1,-1,1,-1,0,-1,-1,1,-1,0,-1],
    [1,1,1,1,-1,1,1,1,-1,1,0,1,-1,0,-1,1,-1,-1,0],
    [0,1,-1,1,1,-1,-1,1,-1,1,1,1,-1,1,-1,1,1,-1,1],
    [0,0,-1,1,0,0,1,1,-1,-1,0,1,-1,1,-1,1,-1,0,-1],
    [0,0,1,0,1,0,1,1,1,-1,-1,1,-1,-1,1,-1,-1,-1,0],
    [0,0,0,0,1,1,0,1,-1,0,-1,-1,1,1,1,1,-1,-1,-1],
    [0,0,1,1,-1,1,1,-1,0,-1,-1,1,1,1,1,0,1,-1,1],
    [0,0,0,1,-1,-1,-1,-1,-1,0,-1,-1,1,1,0,1,1,1,0]
]

exports.middle = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,-1,0,0,0,0,0,0,0,0,0,0,0,0,-1,0,0,0],
    [0,1,1,-1,0,0,0,0,0,0,0,0,0,-1,-1,0,-1,1,0],
    [0,1,-1,-1,0,0,0,0,0,0,0,0,0,0,0,-1,1,0,0],
    [0,0,0,0,-1,0,0,0,0,0,0,0,0,-1,0,0,0,0,0],
    [0,1,1,1,-1,0,0,-1,0,-1,0,0,0,0,1,1,1,0,0],
    [0,0,-1,1,-1,0,0,0,0,0,0,-1,0,-1,0,-1,1,0,0],
    [0,0,-1,-1,1,0,0,1,0,0,1,0,0,-1,-1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,-1,-1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,-1,-1,1],
    [0,0,-1,0,0,0,0,0,0,-1,-1,-1,-1,0,1,-1,-1,1,0],
    [0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,-1,-1,-1,-1,1,0,-1,0],
    [0,0,-1,0,0,0,0,0,0,0,1,0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,-1,0,0,0,-1,-1,-1,0],
    [0,0,0,1,0,0,0,0,0,0,1,-1,0,-1,-1,0,1,1,0],
    [0,0,0,0,0,1,0,0,0,0,1,-1,0,-1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]

exports.unfinished = [
    [0,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,-1,-1,0,1,0,0,0,0,0,0,0,0,0,0,0,-1,0,0],
    [-1,0,-1,-1,1,1,0,1,0,1,1,0,-1,0,-1,0,-1,1,0],
    [-1,0,0,0,-1,-1,-1,1,0,-1,0,0,0,0,0,-1,1,0,0],
    [0,-1,0,-1,1,1,1,-1,-1,0,0,-1,0,0,-1,1,1,0,0],
    [-1,0,-1,-1,0,0,0,-1,0,0,-1,0,0,0,-1,1,0,1,0],
    [-1,-1,1,-1,1,1,1,-1,0,1,1,-1,0,0,1,1,-1,0,0],
    [0,1,0,-1,0,-1,1,-1,0,1,-1,1,0,0,0,0,-1,0,1],
    [0,0,0,-1,0,-1,1,1,0,1,-1,-1,0,0,0,1,1,-1,0],
    [0,0,1,1,1,-1,-1,1,0,0,1,0,-1,-1,1,1,-1,-1,-1],
    [0,-1,-1,-1,1,0,0,1,0,1,0,0,-1,1,0,1,1,-1,0],
    [0,-1,1,1,1,1,0,-1,1,0,0,0,-1,1,0,0,1,-1,0],
    [0,0,0,0,0,-1,0,-1,-1,0,0,0,-1,1,0,0,1,-1,0],
    [0,-1,-1,0,-1,0,0,0,0,0,0,0,-1,-1,1,1,-1,-1,0],
    [0,0,1,-1,0,0,0,0,0,0,0,0,-1,1,-1,-1,1,1,-1],
    [0,0,1,0,1,0,0,0,0,0,0,-1,0,1,0,1,0,0,0],
    [0,0,0,0,0,0,1,0,-1,0,0,-1,1,0,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,-1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]