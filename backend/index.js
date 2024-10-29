const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app =express();
const PORT = 3000;
const fs = require("fs");
const path = require("path");


app.use(cors());
app.use(bodyParser.json());

const dataFilePath = path.join(__dirname, "users.json");
let users = [];

// Charger les utilisateurs depuis le fichier JSON au démarrage
const loadUsersFromFile = () => {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath);
        users = JSON.parse(data);
    }
};

// Sauvegarder les utilisateurs dans le fichier JSON
const saveUsersToFile = () => {
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
};


// Fonction de validation des champs
const validateUser = (user) => {
    const errors = [];

    // Vérification du prénom
    if (!user.firstName || typeof user.firstName !== 'string' || user.firstName.trim().length < 1) {
        errors.push('Le prénom est requis et doit être une chaîne non vide.');
    }

    // Vérification du nom
    if (!user.lastName || typeof user.lastName !== 'string' || user.lastName.trim().length < 1) {
        errors.push('Le nom est requis et doit être une chaîne non vide.');
    }

    // Vérification de l'email
    if (!user.email || typeof user.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push('L\'email est requis et doit être un format valide.');
    }

    // Vérification de l'âge
    if (user.age !== undefined && (typeof user.age !== 'number' || user.age < 0)) {
        errors.push('L\'âge doit être un nombre positif.');
    }

     // Vérification du pays
     if (!user.country || typeof user.country !== 'string' || user.country.trim().length < 1) {
        errors.push('Le pays est requis et doit être une chaîne non vide.');
    }
    return errors;
};

const userFields = {
    id: 'string',
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    age: 'number',
    country: 'string'
};

// Charger les utilisateurs au démarrage
loadUsersFromFile();

// ajout d'utilisateurs
app.post('/api/users', (req,res) => {
    const errors = validateUser(req.body);
    if(errors.length){
        return res.status(400).json({message: errors});
    }
    const { firstName, lastName, email, age, country} = req.body;
    const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        age,
        email,
        country
    };
    users.push(newUser);
    saveUsersToFile(); // Sauvegarder les utilisateurs après ajout
    res.status(201).json(newUser);
});

// récupération des utilisateurs
app.get('/api/users', (req,res) => {
    res.json(users);
});

// récupération d'un utilisateur par son ID
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params; // Assurez-vous d'extraire 'id'
    const userFind = users.find(user => user.id === id); // Utiliser 'id' ici

    if (!userFind) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json(userFind); // Retourner l'utilisateur trouvé
});
// mettre à jour un user spécifique
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const errors = validateUser({...req.body, id});
    if(errors.length){
        return res.status(400).json({message: errors});
    }

    const { firstName, lastName, email, age , country} =  req.body;
    users = users.map(user => user.id === id ? { id , firstName, lastName, email, age , country} : user);
    saveUsersToFile(); // Sauvegarder les utilisateurs après ajout
    res.json(req.body);
});

// supprimer un utilisateur
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    users = users.filter(user => user.id !== id);
    saveUsersToFile(); // Sauvegarder les utilisateurs après ajout
    res.status(204).send("Utilisateur supprimé avec succès ");
});

app.listen(PORT, () => {
    console.log(`> Serveur en écoute sur le port ${PORT}`)
})