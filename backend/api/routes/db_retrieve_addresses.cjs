const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { decrypt } = require('../../utils.cjs');

router.post('/', (req, res) => {
    const { userId } = req.body;

    // Query to get all addresses for the user
    db.query('SELECT address, address_type FROM user_addresses WHERE user_id = ?', userId, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database query error', error: err });
        }

        if (results.length === 0) {
            return res.status(200).json({ message: 'No addresses found for this user', exists: false });
        }

        try {
            // Loop through the results and decrypt each address
            const decryptedAddresses = results.map(({ address, address_type }) => {

                // Parse the encrypted address
                const parsedAddress = JSON.parse(address);

                // Decrypt the address
                const decryptedAddress = decrypt(parsedAddress);

                return {
                    address: decryptedAddress,
                    type: address_type
                };
            });

            // Return all decrypted addresses
            return res.status(200).json({ addresses: decryptedAddresses });
        } catch (error) {
            console.error('Error decrypting addresses:', error);
            return res.status(500).json({ message: 'Error decrypting addresses', error });
        }
    });
});

module.exports = router;
