// Code to mask the API Key
let isMasked = false;
let unmaskedAPIKey = ''; // This will be the actual text of the APIkey
const toggleButton = document.getElementById('toggleButton');
const textarea = document.getElementById('apiKey');

textarea.addEventListener('input', function() {
    if (isMasked) {
        // Append the new text to actualContent and replace the new text with asterisks
        const newText = textarea.value.replace(/\*/g, '');
        unmaskedAPIKey += newText;
        textarea.value = textarea.value.replace(/[^*]/g, '*');
    } else {
        unmaskedAPIKey = textarea.value;
    }
    // Save the apiKey to the cookie using the actualContent variable (which is not masked)
    document.cookie = "apiKey=" + unmaskedAPIKey + "; expires=Fri, 31 Dec 2100 12:00:00 UTC; path=/;";

});

function toggleAPIView() {
    if (!isMasked) {
        // Store the actual content and replace the visible content with asterisks
        unmaskedAPIKey = textarea.value;
        textarea.value = '*'.repeat(unmaskedAPIKey.length);
        isMasked = true;
        toggleButton.src = 'images/show.svg';
    } else {
        // Restore the actual content
        textarea.value = unmaskedAPIKey;
        isMasked = false;
        toggleButton.src = 'images/hide.svg';
    }
}