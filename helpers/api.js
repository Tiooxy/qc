const moment = require('moment-timezone');
const v8 = require('v8');
let heapStat = v8.getHeapStatistics()
function formatSize(bytes, si = true, dp = 2) {
   const thresh = si ? 1000 : 1024;

   if (Math.abs(bytes) < thresh) {
      return `${bytes} B`;
   }

   const units = si
      ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
      : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
   let u = -1;
   const r = 10 ** dp;

   do {
      bytes /= thresh;
      ++u;
   } while (
      Math.round(Math.abs(bytes) * r) / r >= thresh &&
      u < units.length - 1
   );

   return `${bytes.toFixed(dp)} ${units[u]}`;
}
function runtime(seconds) {
   seconds = Number(seconds);
   var d = Math.floor(seconds / (3600 * 24));
   var h = Math.floor((seconds % (3600 * 24)) / 3600);
   var m = Math.floor((seconds % 3600) / 60);
   var s = Math.floor(seconds % 60);
   var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
   var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
   var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
   var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
   return dDisplay + hDisplay + mDisplay + sDisplay;
}

module.exports = async (ctx, next) => {
  ctx.props = Object.assign(ctx.query || {}, ctx.request.body || {})

  try {
    await next()

    if (!ctx.result) {
        //ctx.response.set('Refresh', '1');
        const currentDate = moment().tz('Asia/Jakarta').format('dddd, MMMM Do YYYY, h:mm:ss A');
        return ctx.body = `- Date & Time : ${currentDate}
- Runtime : ${runtime(process.uptime())}
- Heap Executable : ${formatSize(heapStat?.total_heap_size_executable)}
- Physical Size : ${formatSize(heapStat?.total_physical_size)}
- Available Size : ${formatSize(heapStat?.total_available_size)}
- Heap Limit : ${formatSize(heapStat?.heap_size_limit)}
- Malloced Memory : ${formatSize(heapStat?.malloced_memory)}
- Peak Malloced Memory : ${formatSize(heapStat?.peak_malloced_memory)}
- Does Zap Garbage : ${formatSize(heapStat?.does_zap_garbage)}
- Native Contexts : ${formatSize(heapStat?.number_of_native_contexts)}
- Detached Contexts : ${formatSize(heapStat?.number_of_detached_contexts)}
- Total Global Handles : ${formatSize(heapStat?.total_global_handles_size)}
- Used Global Handles : ${formatSize(heapStat?.used_global_handles_size)}`;
      //ctx.body = 'BUKANNYA DI POST, MALAH DI GET KONTOLLLL 😂🤣'
    }

    if (!ctx.body) {
      ctx.assert(ctx.result, 404, 'Not Found')

      if (ctx.result.error) {
        ctx.status = 400
        ctx.body = {
          author: 'LyoSU',
          recode: '@this.ilham_',
          ok: false,
          error: {
            code: 400,
            message: ctx.result.error
          }
        }
      } else {
        if (ctx.result.ext) {
          if (ctx.result.ext === 'webp') ctx.response.set('content-type', 'image/webp')
          if (ctx.result.ext === 'png') ctx.response.set('content-type', 'image/png')
          ctx.response.set('quote-type', ctx.result.type)
          ctx.response.set('quote-width', ctx.result.width)
          ctx.response.set('quote-height', ctx.result.height)
          ctx.body = ctx.result.image
        } else {
          ctx.body = {
            ok: true,
            result: ctx.result
          }
        }
      }
    }


  } catch (error) {
    console.error(error)
    ctx.status = error.statusCode || error.status || 500
    ctx.body = {
      author: 'LyoSU',
      recode: '@this.ilham_',
      ok: false,
      error: {
        code: ctx.status,
        message: error.message,
        description: error.description
      }
    }
  }
}


