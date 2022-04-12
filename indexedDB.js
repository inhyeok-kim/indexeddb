var runType = "dev"; // dev || prod
const DB_NAME = "crud";
const DB_VERSION = '1';
var db;

if(!window.indexedDB){
    alert("Sorry, Your Browser didn't support IndexedDB.");
    window.close();
    history.back();
}

function openDB(){ // DB 초기화
    log('open DB....');
    const req = indexedDB.open(DB_NAME,DB_VERSION); // DB 접근 요청

    req.onerror = function(e){ // 에러 발생
        console.error("openDb:", e.target.errorCode);
    }

    req.onsuccess = function(e){ // DB 로드
        db = this.result; 
        log("openDb DONE");
    };

    req.onupgradeneeded = function(e){ // DB 생성 또는 업데이트
        log("openDb.onupgradeneeded");
        var store = e.currentTarget.result.createObjectStore('people', { keyPath: 'id', autoIncrement: true }); // 자동 key값 옵션 true
  
        store.createIndex('telNum', 'telNum', { unique: true }); // 인덱스 생성, 이건 유일하다. // 컬럼 생성하는거라고 보면 될듯??
        store.createIndex('name', 'name', { unique: false }); // 인덱스 생성
        store.createIndex('year', 'year', { unique: false }); // 인덱스 생성
        store.createIndex('gender', 'gender', { unique: false }); // 인덱스 생성
    }
}

function getObjectStore(store_name, mode) { // 테이블에대한 트랜잭션을 얻는다.
    const tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
}


function log(message){ // 로그찍기
    if(runType == 'dev'){
        console.log(message);
    }
}