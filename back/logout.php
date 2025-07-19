<?php
    session_start();
    session_destroy();
    echo "<script>localStorage.removeItem('usuario'); window.location.href='../home-page/login.html';</script>";
    exit();
?>
