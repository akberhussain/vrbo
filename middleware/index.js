var middlewareObj = {};

middlewareObj.checkIfAdmin = function(req, res, next){

    if(req.isAuthenticated()){
        var obj = {
            a:'5a43713198f27d1030ca180f'
        };
        if(req.user._id.equals(obj.a)){
            // res.redirect("/");
            
             next();
        }
        else{
            req.flash("error", "Your You do not have permission to Access the route !!!");
            res.redirect("back");
        }
    }
    else{
            req.flash("error", "Your You do not have permission to Access the route !!!");
        res.redirect("back");
    }
};

middlewareObj.checkIfLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("error", "You must be logged in to do that");
        res.redirect("/");
    }
}

module.exports = middlewareObj;
