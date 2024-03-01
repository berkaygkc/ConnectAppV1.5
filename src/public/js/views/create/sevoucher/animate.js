$(document).ready(function () {
    $("#preview-created-invoice").hover(
        function () {
            $(this).find("i").addClass("fa-beat-fade");
        },
        function () {
            $(this).find("i").removeClass("fa-beat-fade");
        }
    );
    $("#settings-button").hover(
        function () {
            $(this).find("i").addClass("fa-spin");
        },
        function () {
            $(this).find("i").removeClass("fa-spin");
        }
    );
    $("#save-created-invoice").hover(
        function () {
            $(this).find("i").addClass("fa-bounce");
        },
        function () {
            $(this).find("i").removeClass("fa-bounce");
        }
    );
    $("#send-created-invoice").hover(
        function () {
            $(this).find("i").addClass("fa-flip");
        },
        function () {
            $(this).find("i").removeClass("fa-flip");
        }
    );
    $("#download-button").hover(
        function () {
            $(this).find("i").addClass("fa-flip");
        },
        function () {
            $(this).find("i").removeClass("fa-flip");
        }
    );
});
