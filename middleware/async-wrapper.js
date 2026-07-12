//js 5 has async error built-in

// const asyncWrapper = (fn) => {
//     return (req, res, next) => {
//         Promise.resolve(fn(req, res, next))
//             .catch(next);
//     };
// };

// module.exports = asyncWrapper;

//or use

// const asyncWrapper = (fn) => {
//   return async (req, res, next) => {
//     try {
//       await fn(req, res, next);
//     } catch (err) {
//       next(err);
//     }
//   };
// };

// module.exports = asyncWrapper;


// or use the express-async-error lib but preffer use above 