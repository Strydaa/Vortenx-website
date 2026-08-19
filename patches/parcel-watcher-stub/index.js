'use strict';

/*
 * @parcel/watcher yerine geçen boş uygulama.
 *
 * Neden: bu makinede Windows Smart App Control açık ve paketin imzasız native
 * dosyasını (watcher-win32-arm64/watcher.node) yüklenmeden engelliyor —
 * ERR_DLOPEN_FAILED. `next-intl/plugin` bu paketi koşulsuz require ettiği için
 * hata next.config.ts'e sıçrıyor ve `next dev` hiç açılmıyor.
 *
 * Neden zararsız: next-intl bu izleyiciyi yalnızca deneysel mesaj çıkarıcı
 * (extractor / createMessagesDeclaration) için kullanıyor; bu projede o özellik
 * açık değil. Import'un çözülmesi yeterli, çağrılmıyor. messages/*.json
 * değişiklikleri Next'in kendi izleyicisiyle yeniden yükleniyor.
 *
 * Kaldırmak için: package.json'daki "overrides" girdisini silip
 * `npm install` çalıştırmak yeterli.
 */

function warnOnce() {
  if (warnOnce.done) return;
  warnOnce.done = true;
  console.warn(
    '[parcel-watcher-stub] Dosya izleme devre dışı (Smart App Control). ' +
      'next-intl mesaj çıkarıcısı bu projede kullanılmıyor, sorun değil.',
  );
}

async function subscribe() {
  warnOnce();
  return { unsubscribe: async () => {} };
}

async function unsubscribe() {
  warnOnce();
}

async function getEventsSince() {
  warnOnce();
  return [];
}

async function writeSnapshot(_dir, snapshotPath) {
  warnOnce();
  return snapshotPath;
}

exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.getEventsSince = getEventsSince;
exports.writeSnapshot = writeSnapshot;
exports.default = exports;
