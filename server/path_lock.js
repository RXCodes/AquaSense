export const PathLock = {
  lock_paths,
  unlock_paths,
};

// prevents race conditions when reading and writing to paths in the database
var locked_paths = new Set();
const waiters = [];

function lock_paths(paths) {
  const requested = new Set(paths);

  return new Promise((resolve) => {
    const canLockNow = () => {
      for (const p of requested) {
        if (locked_paths.has(p)) return false;
      }
      return true;
    };

    const lockNow = () => {
      for (const p of requested) locked_paths.add(p);
      resolve();
    };

    if (canLockNow()) {
      lockNow();
      return;
    }

    waiters.push({
      requested,
      resolve: () => {
        for (const p of requested) locked_paths.add(p);
        resolve();
      },
    });
  });
}

function unlock_paths(paths) {
  for (const p of paths) locked_paths.delete(p);

  for (let i = 0; i < waiters.length; ) {
    const w = waiters[i];

    let canProceed = true;
    for (const p of w.requested) {
      if (locked_paths.has(p)) {
        canProceed = false;
        break;
      }
    }

    if (canProceed) {
      waiters.splice(i, 1);
      w.resolve();
    } else {
      i++;
    }
  }
}
