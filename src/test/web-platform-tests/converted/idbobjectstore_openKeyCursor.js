require("../support-node");

function store_test(func, name) {
    indexeddb_test(
        function(t, db, tx) {
            var store = db.createObjectStore("store");
            for (var i = 0; i < 10; ++i) {
                store.put("value: " + i, i);
            }
        },
        function(t, db) {
            var tx = db.transaction("store");
            var store = tx.objectStore("store");
            func(t, db, tx, store);
        },
        name,
    );
}

store_test(function(t, db, tx, store) {
    var expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var actual = [];
    var request = store.openKeyCursor();
    request.onsuccess = t.step_func(function() {
        var cursor = request.result;
        if (!cursor) return;
        assert_equals(cursor.direction, "next");
        assert_false("value" in cursor);
        assert_equals(indexedDB.cmp(cursor.key, cursor.primaryKey), 0);
        actual.push(cursor.key);
        cursor.continue();
    });

    tx.onabort = t.unreached_func("transaction aborted");
    tx.oncomplete = t.step_func(function() {
        assert_array_equals(expected, actual, "keys should match");
        t.done();
    });
}, "IDBObjectStore.openKeyCursor() - forward iteration");

store_test(function(t, db, tx, store) {
    var expected = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    var actual = [];
    var request = store.openKeyCursor(null, "prev");
    request.onsuccess = t.step_func(function() {
        var cursor = request.result;
        if (!cursor) return;
        assert_equals(cursor.direction, "prev");
        assert_false("value" in cursor);
        assert_equals(indexedDB.cmp(cursor.key, cursor.primaryKey), 0);
        actual.push(cursor.key);
        cursor.continue();
    });

    tx.onabort = t.unreached_func("transaction aborted");
    tx.oncomplete = t.step_func(function() {
        assert_array_equals(expected, actual, "keys should match");
        t.done();
    });
}, "IDBObjectStore.openKeyCursor() - reverse iteration");

store_test(function(t, db, tx, store) {
    var expected = [4, 5, 6];
    var actual = [];
    var request = store.openKeyCursor(IDBKeyRange.bound(4, 6));
    request.onsuccess = t.step_func(function() {
        var cursor = request.result;
        if (!cursor) return;
        assert_equals(cursor.direction, "next");
        assert_false("value" in cursor);
        assert_equals(indexedDB.cmp(cursor.key, cursor.primaryKey), 0);
        actual.push(cursor.key);
        cursor.continue();
    });

    tx.onabort = t.unreached_func("transaction aborted");
    tx.oncomplete = t.step_func(function() {
        assert_array_equals(expected, actual, "keys should match");
        t.done();
    });
}, "IDBObjectStore.openKeyCursor() - forward iteration with range");

store_test(function(t, db, tx, store) {
    var expected = [6, 5, 4];
    var actual = [];
    var request = store.openKeyCursor(IDBKeyRange.bound(4, 6), "prev");
    request.onsuccess = t.step_func(function() {
        var cursor = request.result;
        if (!cursor) return;
        assert_equals(cursor.direction, "prev");
        assert_false("value" in cursor);
        assert_equals(indexedDB.cmp(cursor.key, cursor.primaryKey), 0);
        actual.push(cursor.key);
        cursor.continue();
    });

    tx.onabort = t.unreached_func("transaction aborted");
    tx.oncomplete = t.step_func(function() {
        assert_array_equals(expected, actual, "keys should match");
        t.done();
    });
}, "IDBObjectStore.openKeyCursor() - reverse iteration with range");

store_test(function(t, db, tx, store) {
    assert_throws(
        "DataError",
        function() {
            store.openKeyCursor(NaN);
        },
        "openKeyCursor should throw on invalid number key",
    );
    assert_throws(
        "DataError",
        function() {
            store.openKeyCursor(new Date(NaN));
        },
        "openKeyCursor should throw on invalid date key",
    );
    assert_throws(
        "DataError",
        function() {
            var cycle = [];
            cycle.push(cycle);
            store.openKeyCursor(cycle);
        },
        "openKeyCursor should throw on invalid array key",
    );
    assert_throws(
        "DataError",
        function() {
            store.openKeyCursor({});
        },
        "openKeyCursor should throw on invalid key type",
    );
    setTimeout(
        t.step_func(function() {
            assert_throws(
                "TransactionInactiveError",
                function() {
                    store.openKeyCursor();
                },
                "openKeyCursor should throw if transaction is inactive",
            );
            t.done();
        }),
        0,
    );
}, "IDBObjectStore.openKeyCursor() - invalid inputs");
