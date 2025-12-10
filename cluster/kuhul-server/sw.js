// sw.js — K'UHUL Kernel Loader
// Required by browser (MIME-sensitive)
// Loads the real engine: sw.khl (pure symbolic)

self.__KERNEL_VERSION = "KUHUL-LEGION-TRINITY-V3";

// Load the symbolic kernel
importScripts("./sw.khl");

// When sw.khl finishes loading, it automatically
// runs [🌌Sek kuhul_kernel_entry_point] inside the symbolic VM
