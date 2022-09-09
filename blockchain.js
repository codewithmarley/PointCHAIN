// SHA256 Function:
var SHA256 = function SHA256(ascii) {
	function rightRotate(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};
	
	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length'
	var i, j; // Used as a counter across the whole file
	var result = ''

	var words = [];
	var asciiBitLength = '';
	
	//* caching results is optional - remove/add slash from front of this line to toggle
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	// (we actually calculate the first 64, but extra values are just ignored)
	var hash = SHA256.h = SHA256.h || [];
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	var k = SHA256.k = SHA256.k || [];
	var primeCounter = k[lengthProperty];
	/*/
	var hash = [], k = [];
	var primeCounter = 0;
	//*/

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
		}
	}
	
	ascii += '\x80' // Append Ƈ' bit (plus zero padding)
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return; // ASCII check: only accept characters in range 0-255
		words[i>>2] |= j << ((3 - i)%4)*8;
	}
	words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
	words[words[lengthProperty]] = (asciiBitLength)
	
	// process each chunk
	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
		var oldHash = hash;
		// This is now the undefinedworking hash", often labelled as variables a...g
		// (we have to truncate as well, otherwise extra entries at the end accumulate
		hash = hash.slice(0, 8);
		
		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			// Expand the message into 64 words
			// Used below if 
			var w15 = w[i - 15], w2 = w[i - 2];

			// Iterate
			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
				+ ((e&hash[5])^((~e)&hash[6])) // ch
				+ k[i]
				// Expand the message schedule if needed
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
					)|0
				);
			// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
				+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
			
			hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
			hash[4] = (hash[4] + temp1)|0;
		}
		
		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}
	
	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i]>>(j*8))&255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
};

/**
 * Creates a new Block for the blockchain
 */
class Block {
    /**
     * 
     * @param {string} from From address
     * @param {string} to To address
     * @param {int} amount Amount of points being sent
     * @param {{any}} data Any other data (in an array)
     * @param {string} prevhash Previous Hash
     */
    constructor(from, to, amount, data, prevhash) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.data = data;
        this.prevhash = prevhash;
        this.hash = '';
    }

    /**
     * Reloads the hash of the Block
     */
    reloadHash() {
        this.hash = SHA256(this.from + this.to + String(this.amount) + String(this.data) + this.prevhash);
    }
}

class Blockchain {
    /**
     * 
     * @param {string} contract_adress The contract
     * @param {int} limit The max amount of tokens on the Blockchain
     */
    constructor(contract_adress, limit) {
        this.contract_adress = contract_adress;
        this.contract = new Block("null", contract_adress, limit, {}, "null");
        this.contract.reloadHash();
        this.blocks = [this.contract];
        this.save = {"contract_adress": this.contract_adress, "contract": this.contract, "blocks": this.blocks};
    }

    /**
     * 
     * @param {string} from From adress
     * @param {string} to To adress
     * @param {number} amount Amount of Points
     * @param {string} chore Chore name
     */
    createBlock(from, to, amount, chore) {
        var block = new Block(from, to, amount, {"chore": chore}, this.blocks[this.blocks.length-1].hash);
        block.reloadHash();
        this.blocks.push(block)
    }

    /**
     * 
     * @returns a save of the blockchain
     */
    exportSave() {
        this.save = {"contract_adress": this.contract_adress, "contract": this.contract, "blocks": this.blocks};
        return this.save;
    }

    /**
     * 
     * @param {JSON} save Your exported save
     */
    importSave(save) {
        this.contract_adress = save["contract_adress"];
        this.contract = save["contract"];
        this.blocks = save["blocks"];
    }

    /**
     * 
     * @param {string} address 
     * @returns Ballance of the address
     */
    getBallanceOfAdress(address) {
        let balance = 0;

        for (const block of this.blocks) {
            if(block.from === address) {
                balance -= block.amount;
            }

            if (block.to === address) {
                balance += block.amount;
            }
        }

        return balance;
    }
}