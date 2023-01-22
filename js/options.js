var options = GetDefaultOptions();
document.addEventListener('DOMContentLoaded', function() {
    GetOptions().then(function() {
        TranslateText();
        SetupScreen();

        let saveButton = document.getElementById('save');
        saveButton.addEventListener("click", function() {
            Save();
        });

        let cancelButton = document.getElementById('cancel');
        cancelButton.addEventListener("click", function() {
            window.close();
        });
    });
});

function GetOptions() {
    return store.getItem('options').then(function (data) {
        if (data != null) {
            options = data;
            let defaultOptions = GetDefaultOptions();

            // fill in defaults for new options
            for (let key in GetDefaultOptions()) {
                if (options[key] == undefined) {
                    options[key] = defaultOptions[key];
                }
            }
        }
    });
}

function GetDefaultOptions() {
    return {
        "darkmode": true,
        "forcelangen": false
    };
}

function Save()
{
    options.darkmode = (document.getElementById("darkMode").selectedIndex == 1);
    options.forcelangen = (document.getElementById("forceLangEn").selectedIndex == 1);

    store.setItem('options', options).then(function() {
        window.close();
    });
}

function SetupScreen()
{
    if (options.darkmode) {
        activeDarkMode();
    } else {
        disableDarkMode();
    }

    document.getElementById("darkMode").selectedIndex = options.darkmode;
    document.getElementById("forceLangEn").selectedIndex = options.forcelangen;
}