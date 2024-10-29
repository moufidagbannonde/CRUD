<template>
    <div>
        <!--formulaire d'ajout ou de modification d'utilisateur-->
        <button @click="add()" class="addbuton">{{ !isAdding ? "Add" : "Retour"}}</button>
        <div v-if="isAdding">
            <h2>{{ isEditing ? "Modifier un utilisateur" : "Ajouter un utilisateur" }}</h2>
            <form @submit.prevent="isEditing ? updateUser() : addUser()">
                <input v-model="newUser.firstName" placeholder="Prénom" required />
                <input v-model="newUser.lastName" placeholder="Nom" required />
                <input v-model="newUser.email" placeholder="Email" required />
                <input v-model="newUser.age" type="number" placeholder="Âge" required />
                <select v-model="newUser.country" required>
                    <option value="" disabled>Sélectionnez un pays</option>
                    <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
                </select>
                <button type="submit" :disabled="!isFormValid" class="submit">{{ isEditing ? "Mettre à jour" : "Ajouter" }}</button>
            </form>
        </div>
        <!--liste des utilisateurs depuis le fichier users.json-->
        <h1>Liste des utilisateurs</h1>
        <table>
            <thead>
                <tr>
                    <th>Prénom</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Âge</th>
                    <th>Pays</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td>{{ user.firstName }}</td>
                    <td>{{ user.lastName }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.age }}</td>
                    <td>{{ user.country }}</td>
                    <td class="btn">
                        <button class="button-edit" @click="editUser(user)">Modifier</button>
                        <button class="button-delete" @click="removeUser(user.id)">Supprimer</button>
                    </td>
                </tr>
            </tbody>
        </table>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import countries from '../util/countries'

let isAdding = ref(false);

const add = () => {
    isAdding.value = !isAdding.value;
}
const users = ref([]);
const newUser = ref({
    id: null, // Pour stocker l'ID lors de la modification
    firstName: '',
    lastName: '',
    email: '',
    age: 0,
    country: '',
});
const isEditing = ref(false);

// Propriété calculée pour vérifier si le formulaire est valide
const isFormValid = computed(() => {
    return newUser.value.firstName && newUser.value.lastName && newUser.value.email && newUser.value.age && newUser.value.country;
});


// Fonction pour récupérer les utilisateurs
const fetchUsers = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/users');
        console.log("réponse de la requête d'obtention des users ", response);
        users.value = response.data; // Assurez-vous d'accéder à 'data'
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
    }
};

// Fonction pour ajouter un nouvel utilisateur
const addUser = async () => {
    try {
        await axios.post('http://localhost:3000/api/users', newUser.value);
        resetForm();
        fetchUsers(); // Récupérer la liste des utilisateurs
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur :", error);
    }
};

// Fonction pour supprimer un utilisateur
const removeUser = async (id) => {
    try {
        await axios.delete(`http://localhost:3000/api/users/${id}`); // Appel à l'API de suppression
        fetchUsers(); // Récupérer la liste des utilisateurs
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur :", error);
    }
};

// Fonction pour charger un utilisateur pour la modification
const editUser = (user) => {
    newUser.value = { ...user }; // Copier les données de l'utilisateur dans newUser
    isEditing.value = true; // Passer en mode édition
};

// Fonction pour mettre à jour un utilisateur
const updateUser = async () => {
    try {
        await axios.put(`http://localhost:3000/api/users/${newUser.value.id}`, newUser.value);
        resetForm();
        fetchUsers(); // Récupérer la liste des utilisateurs
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    }
};

// Fonction pour réinitialiser le formulaire
const resetForm = () => {
    newUser.value = { id: null, firstName: '', lastName: '', email: '', age: 0, country: '' };
    isEditing.value = false; // Réinitialiser le mode d'édition
};

// Récupérer les utilisateurs lors du montage du composant
onMounted(fetchUsers);
</script>

<style scoped>
/* Style général */
body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #ffffff, #e0f7fa);
    color: #333;
    margin: 0;
    padding: 20px;
}

.btn {
    display: flex;
}
.btn button {
    width: 90px;
    text-align: center;
}
/* Titre principal */
h1 {
    font-size: 2.8rem;
    color: #007ACC;
    text-align: center;
    margin-bottom: 30px;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* Sous-titre */
h2 {
    font-size: 2rem;
    color: #555;
    margin: 25px 0;
    text-align: center;
    border-bottom: 3px solid #007ACC;
    padding-bottom: 10px;
}

/* Table */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    background-color: #ffffff;
}

th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 2px solid #f0f0f0;
}

th {
    background-color: #007ACC;
    color: white;
    font-weight: bold;
    letter-spacing: 1px;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

tr:hover {
    background-color: #eaf6ff;
    transform: scale(1.01);
    transition: transform 0.2s;
}

/* Boutons */
.button-delete {
    background-color: #ff4757; /* Rouge vif pour la suppression */
    transition: background-color 0.3s, transform 0.2s;
}

.button-edit {
    background-color: #1e90ff; /* Bleu vif pour la modification */
    transition: background-color 0.3s, transform 0.2s;
}

button {
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 1rem;
    cursor: pointer;
    margin: 5px;
}

.button-delete:hover {
    background-color: #ff6b81; /* Une teinte plus claire pour le hover */
    transform: translateY(-2px);
}

.button-edit:hover {
    background-color: #1c86ee; /* Une teinte plus claire pour le hover */
    transform: translateY(-2px);
}

/* Formulaire */
form {
    background: #ffffff;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    max-width: 500px;
    margin: 0 auto;
}

form button , .addbuton{
    width: 100%;
    margin-top: 15px;
    color: white; /* Couleur du texte */
    background-color: #28a745; /* Vert pour indiquer une action réussie */
    border: none; /* Pas de bordure */
    border-radius: 8px; /* Coins arrondis */
    padding: 12px; /* Padding pour le confort */
    font-size: 1rem; /* Taille de la police */
    cursor: pointer; /* Curseur pointer pour indiquer que c'est cliquable */
    transition: background-color 0.3s, transform 0.2s; /* Transition douce pour les effets */
}

form button:hover {
    background-color: #218838; /* Une teinte plus foncée au survol */
    transform: translateY(-2px); /* Légère élévation au survol */
}

form button:disabled {
    background-color: #c6c8ca; /* Couleur grise pour le bouton désactivé */
    cursor: not-allowed; /* Indique que le bouton n'est pas cliquable */
}

/* Champs de saisie */
input, select {
    width: 90%;
    padding: 12px;
    margin: 5px 0 15px 0;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus, select:focus {
    border-color: #007ACC;
    outline: none;
    box-shadow: 0 0 8px rgba(0, 122, 204, 0.3);
}
</style>