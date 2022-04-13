// 공통부

var runType = "dev"; // dev || prod
const DB_NAME = "crud";
const DB_VERSION = '1';
var db;
const tables = {
    people : "people",
}
const Mode = {
    read : "readonly",
    edit : "readwrite",
}

if(!window.indexedDB){
    alert("Sorry, Your Browser didn't support IndexedDB.");
    window.close();
    history.back();
}
openDB();
function openDB(){ // DB 초기화
    log('open DB....');
    const req = indexedDB.open(DB_NAME,DB_VERSION); // DB 접근 요청

    req.onerror = function(e){ // 에러 발생
        console.error("openDb:", e.target.errorCode);
    }

    req.onsuccess = function(e){ // DB 로드
        db = this.result; 
        log("openDb DONE");
        selectPeople();
    };

    req.onupgradeneeded = function(e){ // DB 생성 또는 업데이트
        log("openDb.onupgradeneeded");
        
        var store = e.currentTarget.result.createObjectStore('people', { keyPath: 'id', autoIncrement: true }); // 자동 key값 옵션 true
  
        store.createIndex('telNum', 'telNum', { unique: true }); // 인덱스 생성, 이건 유일하다. // 컬럼 생성하는거라고 보면 될듯??
        store.createIndex('name', 'name', { unique: false }); // 인덱스 생성
        store.createIndex('gender', 'gender', { unique: false }); // 인덱스 생성
    }
}

function getObjectStore(store_name, mode) { // 테이블에대한 스토어를 얻는다.
    const tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
}


function log(message){ // 로그찍기
    if(runType == 'dev'){
        console.log(message);
    }
}
function error(message){
    if(runType =='dev'){
        console.error(message);
    }
}

// 공통부 끝

// DAO
function getPeople(){
    return new Promise(function(resolve, reject){
        const store = getObjectStore(tables.people, Mode.read);
        const req = store.openCursor();
        let result = [];
        req.onsuccess = function(e){
            const cursor = e.target.result;
            if(cursor){
                result.push(cursor.value);
                cursor.continue();
            } else {
                resolve(result);
            }
    
        }
    });
}

function getPerson(id){
    return new Promise(function(resolve, reject){
        const store = getObjectStore(tables.people, Mode.read);
        const req = store.get(id);
        req.onsuccess = function(e){
            const result = e.target.result;
            resolve(result);
        }
    });
}

function removePerson(id){
    return new Promise(function(res, rej){
        const store = getObjectStore(tables.people, Mode.edit);
        const req = store.delete(id);
        req.onsuccess = function(e){
            res(true);
        }
    });
}

function updatePerson(person){
    return new Promise(function(res, rej){
        const store = getObjectStore(tables.people, Mode.edit);
        const req = store.get(Number(person.id));
        req.onsuccess = function(event){
            let data = event.target.result;
            data.name=person.name;
            data.age=person.age;
            data.gender=person.gender;
            data.telNum=person.telNum;
            const updReq = store.put(data);
            updReq.onsuccess = function(){
                res(true);
            }
        }


    });
}

function addPerson({name, age, gender, telNum}){
    return new Promise(function(resolve, reject){
        const store = getObjectStore(tables.people, Mode.edit);
        const newPerson = {name : name, age : age, gender :gender, telNum:telNum};
        let req;
    
        try {
            req = store.add(newPerson);
        } catch (e) {
            console.error(e);
        }
    
        req.onerror = function(){
            console.error(this.error);
        }
    
        req.onsuccess = function(e){
            log('add successed');
            resolve(true);
        }
    });
}

// DAO 끝
