const TILE_SIZE = 30;
const GRID_WIDTH = 100; 
const GRID_HEIGHT = 100;
const DEFAULT_TILE = 'grass';

class TileGrid {
    constructor(width = GRID_WIDTH, height = GRID_HEIGHT, defaultTile = DEFAULT_TILE) {
        this.width = width;
        this.height = height;
        this.defaultTile = defaultTile;
        this.tiles = new Map();
    }

    _key(x, y) {
        return `${x},${y}`;
    }

    inBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    getTile(x, y) {
        if (!this.inBounds(x, y)) return null;
        const key = this._key(x, y);
        return this.tiles.has(key) ? this.tiles.get(key) : this.defaultTile;
    }

    setTile(x, y, type) {
        if (!this.inBounds(x, y)) return false;
        const key = this._key(x, y);
        if (type === this.defaultTile) {
            this.tiles.delete(key); // reverting to default = no need to store it
        } else {
            this.tiles.set(key, type);
        }
        return true;
    }

    modifiedCount() {
        return this.tiles.size;
    }

    worldToGrid(px, py) {
        return {
            x: Math.floor(px / TILE_SIZE),
            y: Math.floor(py / TILE_SIZE),
        };
    }

    gridToWorld(x, y) {
        return {
            px: x * TILE_SIZE,
            py: y * TILE_SIZE,
        };
    }

    getVisibleTiles(camLeft, camTop, camRight, camBottom) {
        const start = this.worldToGrid(camLeft, camTop);
        const end = this.worldToGrid(camRight, camBottom);
        const visible = [];

        for (let y = start.y; y <= end.y; y++) {
            for (let x = start.x; x <= end.x; x++) {
                if (!this.inBounds(x, y)) continue;
                visible.push({ x, y, type: this.getTile(x, y) });
            }
        }
        return visible;
    }
}

module.exports = { TileGrid, TILE_SIZE, GRID_WIDTH, GRID_HEIGHT };
