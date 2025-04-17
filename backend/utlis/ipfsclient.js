const { create } = require('ipfs-http-client');

const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: `Basic ${Buffer.from(
            `${process.env.INFURA_IPFS_ID}:${process.env.INFURA_IPFS_SECRET}`
        ).toString('base64')}`
    }
});

module.exports = ipfs;