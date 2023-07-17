/*Chamei a fuhnção signOut de logout do firebase, desconectando o usuário ao clicar em sair */
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "../login/login.html";
    }).catch(() => {
        alert('Erro ao fazer logout');
    });
}

/*Buscar usuário para obter a base de dados dele*/

firebase.auth().onAuthStateChanged(user => {
    if (user){
        findTransactions(user);
    }
})


/*Buscar usuário para obter a base de dados dele*/
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
            const transactions = snapshot.docs.map(doc => doc.data());
            // Mapeia os dados dos documentos para obter um array de objetos de transações
            addTransactionsToScreen(transactions);
            // Chama a função addTransactionsToScreen, passando o array de transações como argumento
        })
        .catch(error => {
            hideLoading();
            console.error(error);
            alert('"Erro ao buscar transações:"')
        });
}


function addTransactionsToScreen(transactions){
    const orderedList = document.getElementById('transactions')

    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add(transaction.type);

        const date = document.createElement('p')
        date.innerHTML = formatDate(transaction.date);
        li.appendChild(date);

        const money = document.createElement('p')
        money.innerHTML = formatMoney(transaction.money);
        li.appendChild(money);

        const type = document.createElement('p')
        type.innerHTML = transaction.transactionType;
        li.appendChild(type);

        if (transaction.description){
            const description = document.createElement('p')
            description.innerHTML = transaction.description;
            li.appendChild(description);
        }

        orderedList.appendChild(li);
    });

}

function formatMoney(money){
    return `${money.currency} ${money.value.toFixed(2)}`
}

function formatDate(date){
    return new Date(date).toLocaleDateString('pt-br')
}

const fakeTransactions = [{
    type: 'expense',
    date: '2022-01-04',
    money:{
        currency: 'R$',
        value: 10
    },
    transactionType:'Supermercado',
}, {
    type: 'income',
    date: '2022-01-04',
    money:{
        currency: 'R$',
        value: 5000
    },
    transactionType:'Salário',
    description: 'Empresa A'
}, {
    type: 'expense',
    date: '2022-01-04',
    money:{
        currency: 'R$',
        value: 10
    },
    transactionType:'Supermercado',
}, {
    type: 'income',
    date: '2022-01-04',
    money:{
        currency: 'R$',
        value: 5000
    },
    transactionType:'Salário',
    description: 'Empresa A'
}]