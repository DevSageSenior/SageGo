const {getNeighbors, getChain} = require('./helper')

module.exports = function(data, edges) {
    let map = new Array(data.length).fill(null)

    const getNeighbors = (u) => {
        return edges[u];
    }

    const getChain = (v, result = [], done = {}, sign = null) => {
        if (sign == null) sign = data[v]
        let neighbors = getNeighbors(v)
        result.push(v)
        done[v] = true
    
        for (let n of neighbors) {
            if (data[n] !== sign || n in done)
                continue
    
            getChain(n, result, done, sign)
        }
    
        return result
    }

    for (let i = 0; i < data.length; i ++){

        if (map[i] !== null) continue
        if (data[i] !== 0) {
            map[i] = data[i]
            continue
        }

        let chain = getChain(i)
        let sign = 0
        let indicator = 1

        for (let c of chain) {
            if (indicator === 0) break

            for (let n of getNeighbors(c)) {
                if (data[n] == null || data[n] === 0) continue

                if (sign === 0) {
                    sign = Math.sign(data[n])
                } else if (sign !== Math.sign(data[n])) {
                    indicator = 0
                    break
                }
            }
        }

        for (let c of chain) {
            map[c] = sign * indicator
        }
    }

    return map
}
