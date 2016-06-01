$(document).ready(function() {
    $("#play").click(function(e) {
        e.preventDefault()
        
        window.localPlayer.displayName = $("#username").val();
        window.localPlayer.label.setText($("#username").val());
        $(".gameDiv").fadeOut(300)
        eurecaServer.assignName(window.localPlayer.playerSprite.id, $("#username").val());
    });
})