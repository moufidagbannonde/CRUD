<template>
    <div>
        <h1 title="Liste des utilisateurs">Lista de Usuários</h1>
        <button @click="add()" class="botao" v-if="!ajout" title="Ajouter">Adicionar</button>

        <div v-if="isLoading" class="spinner" title="Chargement...">Carregando...</div>

        <!-- Notificações -->
        <div v-if="notification.visible" :class="`notification ${notification.type}`" :title="notification.type === 'success' ? 'Succès' : 'Erreur'">
            {{ notification.message }}
        </div>

        <!-- Mostrar a lista de usuários somente se showUsersList for verdadeiro -->
        <div v-if="showUsersList">
            <table>
                <thead>
                    <tr>
                        <th title="Prénom">Primeiro Nome</th>
                        <th title="Nom">Sobrenome</th>
                        <th title="Email">Email</th>
                        <th title="Âge">Idade</th>
                        <th title="Pays">País</th>
                        <th title="Actions">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td :title="`Prénom: ${user.firstName}`">{{ user.firstName }}</td>
                        <td :title="`Nom: ${user.lastName}`">{{ user.lastName }}</td>
                        <td :title="`Email: ${user.email}`">{{ user.email }}</td>
                        <td :title="`Âge: ${user.age}`">{{ user.age }}</td>
                        <td :title="`Pays: ${user.country}`">{{ user.country }}</td>
                        <td class="btn">
                            <button class="button-edit" @click="editUser(user)" title="Modifier">Modificar</button>
                            <button class="button-delete" @click="removeUser(user.id)" title="Supprimer">Excluir</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Formulário de adicionar ou editar usuário -->
        <div v-if="isAdding">
            <h2 :title="isEditing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'">
                {{ isEditing ? "Modificar um usuário" : "Adicionar um usuário" }}
            </h2>
            <form @submit.prevent="isEditing ? updateUser() : addUser()">
                <input v-model="newUser.firstName" placeholder="Primeiro Nome" required title="Prénom" />
                <input v-model="newUser.lastName" placeholder="Sobrenome" required title="Nom" />
                <input v-model="newUser.email" placeholder="Email" required title="Email" />
                <input v-model="newUser.age" type="number" placeholder="Idade" required title="Âge" />
                <select v-model="newUser.country" required title="Pays">
                    <option value="" disabled>Selecione um país</option>
                    <option v-for="country in countries" :key="country" :value="country" :title="`Pays: ${country}`">{{ country }}</option>
                </select>
                <button type="submit" :disabled="!isFormValid" class="submit" :title="isEditing ? 'Mettre à jour' : 'Ajouter'">
                    {{ isEditing ? "Atualizar" : "Adicionar" }}
                </button>
                <button @click="goBack" class="botao-retorno" title="Retour">Voltar</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import countries from '../util/countries';

const isLoading = ref(false);
const ajout = ref(false);
let showUsersList = ref(true);
let isAdding = ref(false);
const users = ref([]);
const newUser = ref({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    age: 0,
    country: '',
});
const isEditing = ref(false);

// Notifications
const notification = ref({
    visible: false,
    message: '',
    type: '' // 'success' ou 'error'
});

const add = () => {
    isAdding.value = true;
    showUsersList.value = false;
    ajout.value = true
};

const goBack = () => {
    resetForm();
    ajout.value = false
};
const isFormValid = computed(() => {
    return newUser.value.firstName && newUser.value.lastName && newUser.value.email && newUser.value.age && newUser.value.country;
});

const fetchUsers = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get('http://localhost:3000/api/users');
        users.value = response.data;
        showUsersList.value = true;
        showNotification('success', 'Utilisateurs chargés avec succès !');
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        showNotification('error', 'Erreur lors du chargement des utilisateurs.');
    } finally {
        isLoading.value = false;
    }
};

const addUser = async () => {
    isLoading.value = true;
    try {
        await axios.post('http://localhost:3000/api/users', newUser.value);
        resetForm();
        ajout.value = false
        await fetchUsers();
        showNotification('success', 'Utilisateur ajouté avec succès !');
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur :", error);
        showNotification('error', 'Erreur lors de l\'ajout de l\'utilisateur.');
    } finally {
        isLoading.value = false;
    }
};

const removeUser = async (id) => {
    try {
        await axios.delete(`http://localhost:3000/api/users/${id}`);
        await fetchUsers();
        showNotification('success', 'Utilisateur supprimé avec succès !');
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur :", error);
        showNotification('error', 'Erreur lors de la suppression de l\'utilisateur.');
    }
};

const editUser = (user) => {
    newUser.value = { ...user };
    isEditing.value = true;
    isAdding.value = true;
    showUsersList.value = false;
};

const updateUser = async () => {
    try {
        await axios.put(`http://localhost:3000/api/users/${newUser.value.id}`, newUser.value);
        resetForm();
        await fetchUsers();
        showNotification('success', 'Utilisateur mis à jour avec succès !');
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
        showNotification('error', 'Erreur lors de la mise à jour de l\'utilisateur.');
    }
};

const resetForm = () => {
    newUser.value = { id: null, firstName: '', lastName: '', email: '', age: 0, country: '' };
    isEditing.value = false;
    isAdding.value = false;
    showUsersList.value = true;
};

// Fonction pour afficher les notifications
const showNotification = (type, message) => {
    notification.value = { visible: true, type, message };
    setTimeout(() => {
        notification.value.visible = false; // Masquer la notification après 3 secondes
    }, 3000);
};

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
    justify-content: center; /* Centre le contenu horizontalement */
    align-items: center; /* Centre le contenu verticalement */
    gap: 5px; 
}
.btn button {
    width: 100px;
    padding: 7px;
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
    background-color: #1c86ee; /* Bleu vif pour la modification */
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

.botao {
    width: 220px; /* Largeur légèrement augmentée */
    background-color: #007BFF; /* Bleu vif */
    color: white; /* Couleur du texte */
    border: none; /* Pas de bordure */
    border-radius: 8px; /* Coins arrondis */
    padding: 12px 20px; /* Padding plus confortable */
    font-size: 1.1rem; /* Taille de police légèrement augmentée */
    cursor: pointer; /* Curseur pointer */
    transition: background-color 0.3s, transform 0.2s; /* Transition pour les effets */
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2); /* Ombre légère */
}

.bouton:hover {
    background-color: #0056b3; /* Couleur plus foncée au survol */
    transform: translateY(-2px); /* Légère élévation au survol */
}
.button-delete:hover {
    background-color: #ff6b81; /* Une teinte plus claire pour le hover */
    transform: translateY(-2px);
}

.button-edit:hover {
    background-color: #23f3d78e; /* Une teinte plus claire pour le hover */
    transform: translateY(-2px);
    color: black;
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

form button {
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

/**spinner */
.spinner {
    text-align: center;
    font-size: 1.5rem;
    color: #007ACC;
    margin-top: 20px;
}

/* Notifications */
.notification {
    padding: 10px;
    margin: 20px 0;
    border-radius: 5px;
    text-align: center;
}

.notification.success {
    background-color: #d4edda; /* Vert clair */
    color: green; /* Texte vert foncé */
}

.notification.error {
    background-color: #f8d7da; /* Rouge clair */
    color: red; /* Texte rouge foncé */
}
/**bouton de retour */
.bouton-retour {
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.bouton-retour:hover {
    background-color: #5a6268;
}

</style>


