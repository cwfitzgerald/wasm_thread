console.log("Pre-init worker: WASM_BINDGEN_SHIM_URL");

// synchronously, using the browser, import wasm_bindgen shim JS scripts
import init, {wasm_thread_entry_point} from "WASM_BINDGEN_SHIM_URL";

console.log(`init: ${init}`);

// Wait for the main thread to send us the shared module/memory and work context.
// Once we've got it, initialize it all with the `wasm_bindgen` global we imported via
// `importScripts`.
self.onmessage = event => {
    console.log("onmessage call");

    let [ module, memory, work ] = event.data;

    init(module, memory).catch(err => {
        console.log(err);

        // Propagate to main `onerror`:
        setTimeout(() => {
            throw err;
        });
        // Rethrow to keep promise rejected and prevent execution of further commands:
        throw err;
    }).then(() => {
        console.log("calling wasm_thread_entry_point");

        // Enter rust code by calling entry point defined in `lib.rs`.
        // This executes closure defined by work context.
        wasm_thread_entry_point(work);

        // Once done, terminate web worker
        close();
    });
};