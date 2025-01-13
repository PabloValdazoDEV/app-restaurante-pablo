const prisma = require("../prisma/prisma");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const isAdmin = require("../middelware/isAdmin");
const isLogin = require("../middelware/isLogin");

router.get("/create", isAdmin, (req, res) => {
  try {
    res.render("create", {
      isAdmin: req.user.role === "ADMIN" ? true : false,
    });
  } catch (error) {
    res.status(500).redirect("/error-404");
  }
});

router.post("/create", isAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  const regex = /^(?=.*[A-Z]).{7,}$/;
  try {
    if (!regex.test(password.trim()) && !username && !password) {
        res.status(500);
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        role: role,
      },
    });
    res.redirect("/auth/login");
  } catch (error) {
    console.error(`El error es ${error}`);
    res.status(500).redirect("/error-404");
  }
});

router.get("/login", isLogin, (req, res) => {
  res.render("login", {
    layout: "cliente",
  });
});

router.post(
  "/login",
  isLogin,
  passport.authenticate("local", {
    successRedirect: "/order/queue",
    failureRedirect: "/auth/logout",
    failureFlash: false,
  })
);

router.get("/logout", function (req, res, next) {
  try {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/auth/login");
    });
  } catch (error) {
    console.error(`El error es ${error}`);
    res.status(500).redirect("/error-404");
  }
});

router.get("/users", isAdmin, async (req, res) => {
  try {
    const allUser = await prisma.user.findMany({});
    res.render("users", {
      isAdmin: req.user.role === "ADMIN" ? true : false,
      users: allUser 
    });
  } catch (error) {
    console.error(`El error es ${error}`);
    res.status(500).redirect("/error-404");
  }
});

router.get('/users/:id', async (req, res)=>{
    const { id } = req.params
    try {
        const userEdit = await prisma.user.findUnique({
            where:{
                id
            }
        })

        res.render('edit-user',{
            isAdmin: req.user.role === "ADMIN" ? true : false,
            user: userEdit,
            otherRole: userEdit.role === 'ADMIN' ? 'EMPLOYER' : 'ADMIN'
        })
    } catch (error) {
        console.error(`El error es ${error}`);
        res.status(500).redirect("/error-404");
    }
})

router.put('/users/:id', async (req, res)=>{
    const { id } = req.params
    const { username, role } = req.body
    try {
        await prisma.user.update({
            where:{
                id
            },
            data:{
                username,
                role
            }
        })
        res.redirect('/auth/users')
    } catch (error) {
        console.error(`El error es ${error}`);
        res.status(500).redirect("/error-404");
    }
})

router.put('/users/password/:id', async (req, res)=>{
    const { id } = req.params
    const { password, passwordNew, passwordNewRep } = req.body
    try {

        const userPass = await prisma.user.findUnique({ where : { id }})

        const isMatch = await bcrypt.compare(password, userPass.password);

        if (!isMatch) {
            return res.status(500).render('edit-user', {
                error: true,
                isAdmin: req.user.role === "ADMIN" ? true : false,
                user: userPass,
                otherRole: userPass.role === 'ADMIN' ? 'EMPLOYER' : 'ADMIN'
            })
        }

        if(passwordNew !== passwordNewRep){
            res.status(500).message({ message: 'Las contraseñas no coinciden' });
        }

        const hashedPassword = await bcrypt.hash(passwordNew, 10);

        await prisma.user.update({
            where:{id},
            data:{password: hashedPassword}
        })

        res.redirect('/auth/users')

    } catch (error) {
        console.error(`El error es ${error}`);
        res.status(500).redirect("/error-404");
    }
})

router.delete('/users/delete/:id', async(req, res)=>{
    const { id } = req.params
    try {
        await prisma.user.delete({where : { id }})
        res.redirect('/auth/users')
    } catch (error) {
        console.error(`El error es ${error}`);
        res.status(500).redirect("/error-404");
    }
})

module.exports = router;
