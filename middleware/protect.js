//Streamlined passport middleware for cleaner usage in routes.

import passport from "./passportConfig.js";

const protect = passport.authenticate("jwt", {session: false});

export default protect;