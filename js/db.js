import { openDB } from "idb";

let db;
async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('anotacao', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    document.getElementById('btnBuscar').addEventListener('click', buscarAnotacao);
    document.getElementById('btnCadastro').addEventListener('click', adicionarAnotacao);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasAnotacoes);
});

async function buscarTodasAnotacoes(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('anotacao', 'readonly');
    const store = await tx.objectStore('anotacao');
    const anotacoes = await store.getAll();
    if(anotacoes){
        const divLista = anotacoes.map(anotacao => {
            return `<div class="item">
                    <p>Anotação</p>
                    <p>${anotacao.titulo} - ${anotacao.data} </p>
                    <p>${anotacao.descricao}</p>
                    <button class="deletar">excluir</button>
                   </div>`;
        });
        listagem(divLista.join(' '));

        const deletar = document.querySelectorAll(".deletar");
        deletar.forEach((deletar, index) => {
            deletar.addEventListener("click", () => deletarAnotacao(anotacoes[index].titulo));
        });
    }
}

async function adicionarAnotacao() {

    let titulo = document.getElementById("titulo").value;
    let descricao = document.getElementById("descricao").value;
    let data = document.getElementById("data").value;
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');
    try {
        await store.add({ titulo: titulo, descricao: descricao, data: data });
        await tx.done;
        limparCampos();
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}


async function deletarAnotacao(titulo) {
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');

    try {
        await store.delete(titulo);
        buscarTodasAnotacoes()
        console.log('Registro excluído com sucesso!');

    } catch (error) {
        console.error('Erro ao EXCLUIR registro:', error);
        tx.abort();
    }
}


async function buscarAnotacao() {
    let titulo = document.getElementById("titulo").value;
    let descricao = document.getElementById("descricao").value;
    let data = document.getElementById("data").value;
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');

    try {
        await store.add({ titulo: titulo, descricao: descricao, data: data });
        await tx.done;
        limparCampos();
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}

function limparCampos() {
    document.getElementById("titulo").value = '';
    document.getElementById("descricao").value = '';
    document.getElementById("data").value = '';
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
 
}