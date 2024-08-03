
const AvoidIndex = (req, res, next)=>{
    
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    req.app.set('userData', userCookie);
    
    if (userCookie){
        
        return res.status(401).redirect('/login');
        
    } else{
        return next();
    }
};

const UserLoggin = (req, res, next)=>{
    
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    req.app.set('userData', userCookie);
    
    if (userCookie){
        return next();
        
    } else{
        return res.status(401).redirect('/logout');
    }
};

const ManRole = (req, res, next)=>{
    
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    req.app.set('userData', userCookie);
    
    if (userCookie.mee.user_role === "management"){
        return next();
        
    } else{
        return res.status(401).redirect('/logout');
    }
};

const StaffRole = (req, res, next)=>{
    
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    req.app.set('userData', userCookie);
    
    if (userCookie.mee.user_role === "staff"){
        return next();
        
    } else{
        return res.status(401).redirect('/logout');
    }
};



module.exports = {UserLoggin, AvoidIndex, ManRole,  StaffRole}