require("../support-node");

var db,
    t = async_test(document.title, { timeout: 600000 }),
    open_rq = createdb(t);

open_rq.onupgradeneeded = function(e) {
    db = e.target.result;
    var st, i;
    for (i = 0; i < 1000; i++) {
        st = db.createObjectStore("object_store_" + i);
        st.add("test", 1);
    }

    st.get(1).onsuccess = t.step_func(function(e) {
        assert_equals(e.target.result, "test");
    });
};
open_rq.onsuccess = function(e) {
    db.close();
    window.indexedDB.deleteDatabase(db.name).onsuccess = function(e) {
        t.done();
    };
};
