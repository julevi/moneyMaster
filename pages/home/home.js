function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "../login/login.html";
    }).catch(() => {
        alert('Erro ao fazer logout');
    });
}
/*Chamei a função signout de logout do firebase, desconectando o usuário ao clicar em sair */

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        findTransactions(user);
    }
})
/*Se o usuário estiver autenticado (ou seja, se user for um objeto válido), a função findTransactions() é chamada para buscar as transações associadas ao usuário*/

function findTransactions(user) {
    showLoading();
    firebase.firestore()
        .collection('transactions')
        // Faz uma consulta para buscar as transações onde o campo 'user.uid' seja igual ao UID do usuário autenticado
        .where('user.uid', '==', user.uid)
        // Realiza a consulta no Firestore
        .orderBy('date', 'desc')
        //Colocar os dados em ordem decrescente
        .get()
        .then(snapshot => {
            hideLoading();
            // O método then é chamado quando a consulta é concluída e retorna um snapshot com os resultados
            // O snapshot.docs contém os documentos que correspondem à consulta
            const transactions = snapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id
            }));
            // Mapeia os dados dos documentos para obter um array de objetos de transações
            addTransactionsToScreen(transactions);
            // Chama a função addTransactionsToScreen, passando o array de transações como argumento
            calculateAndShowTotalMoney(transactions)

        })
        .catch(error => {
            hideLoading();
            console.error(error);
            alert('Erro ao buscar transações:')
        });
}

function calculateAndShowTotalMoney(transactions) {
    let totalMoney = 0;
    transactions.forEach(transaction => {
        totalMoney += transaction.money.value;
    });
    // Agora você tem o totalMoney que é a soma de todos os valores monetários das transações do usuário.
    // Exiba o resultado onde desejar, por exemplo:
    console.log("Total Money:", totalMoney);
    // Ou, se você quiser exibir no HTML, crie um elemento e insira o valor dentro dele.
    const totalMoneyElement = document.getElementById('totalMoney');
    if (totalMoneyElement) {
        totalMoneyElement.innerText = formatMoney({ currency: 'R$', value: totalMoney });
    }
}

function addTransactionsToScreen(transactions) {
    const orderedList = document.getElementById('transactions')

    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add(transaction.type);
        li.id = transaction.uid
        li.addEventListener('click', () => {
            window.location.href = '../transaction/transaction.html?uid=' + transaction.uid;
        })
        const deleteButton = document.createElement('button')
        deleteButton.innerHTML = "Excluir"
        deleteButton.classList.add('outline', 'danger')
        deleteButton.addEventListener('click', event => {
            event.stopPropagation();
            askRemoveTransaction(transaction);
        })
        li.appendChild(deleteButton);

        const date = document.createElement('p')
        date.innerHTML = formatDate(transaction.date);
        date.classList.add('data')
        li.appendChild(date);

        const money = document.createElement('h1')
        money.innerHTML = formatMoney(transaction.money);
        money.classList.add('money')
        li.appendChild(money);

        const type = document.createElement('p')
        type.innerHTML = transaction.transactionType;
        li.appendChild(type);

        if (transaction.description) {
            const description = document.createElement('p')
            description.innerHTML = transaction.description;
            li.appendChild(description);
        }

        orderedList.appendChild(li);
    });

}

function askRemoveTransaction(transaction) {
    const shouldRemove = confirm('Deseja remover a transação?')
    if (shouldRemove) {
        removeTransaction(transaction);
    }
}

function removeTransaction(transaction) {
    showLoading();
    firebase.firestore()
        .collection("transactions")
        .doc(transaction.uid)
        .delete()
        .then(() => {
            hideLoading();
            document.getElementById(transaction.uid).remove();
            window.location.reload();
        })
        .catch(error => {
            hideLoading();
            console.log(error);
            alert('Erro ao atualizar transação');
        });

}

function formatMoney(money) {
    const formattedValue = money.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return formattedValue;
}


function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-br')
}

function newTransaction() {
    window.location.href = "../transaction/transaction.html";
}

let originalTotal = null;
let isTotalHidden = false;

function fecharOlho() {
    const valorTotalElement = document.getElementById('totalMoney');
    const olhoImgElement = document.getElementById('olhoImg');

    if (valorTotalElement && olhoImgElement) {
        if (originalTotal === null) {
            originalTotal = valorTotalElement.innerText;
            valorTotalElement.innerText = "---";
            olhoImgElement.src = "../../img/close-eye.png";
        } else {
            valorTotalElement.innerText = originalTotal;
            originalTotal = null;
            olhoImgElement.src = "../../img/view.png";
        }
    }
}

