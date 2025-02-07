let globalUserDetails = null; // Declare a global variable to store user details

document.addEventListener('DOMContentLoaded', () => {
    const userId = getQueryParam('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        showMessage('User ID is not set. Please log in.', 'error');
        return;
    }
    fetchUserDetails(userId);
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function fetchUserDetails(userId) {
    try {
        const response = await fetch(`http://localhost:8090/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network response was not ok: ${response.statusText}. ${errorText}`);
        }

        const data = await response.json();
        console.info("Received User Details:", data); // Use console.info to log response for debugging
        globalUserDetails = data; // Save the user details to the global variable
        displayUserDetails(data);
        showMessage('User details loaded successfully!', 'success');
    } catch (error) {
        showMessage(`Error fetching details: ${error.message}`, 'error');
    }
}

function displayUserDetails(userDetails) {
    const userDetailsDiv = document.getElementById('user-details');
    if (!userDetailsDiv) {
        showMessage('Element with id "user-details" not found.', 'error');
        return;
    }

    console.log("Payment Status:", userDetails.paymentStatus); // Log payment status for debugging

    const paymentLink = userDetails.paymentStatus.includes('Payment Pending')
        ? `<p><a href="payment.html?userId=${userDetails.id}">Complete Payment</a></p>`
        : '';

    // Clear existing content and add user details
    userDetailsDiv.innerHTML = `
        <p><strong>Full Name:</strong> ${userDetails.fullName}</p>
        <p><strong>Email:</strong> ${userDetails.email}</p>
        <p><strong>City:</strong> ${userDetails.city}</p>
        <p><strong>Mobile Number:</strong> ${userDetails.mobileNumber}</p>
        <p><strong>Referred by:</strong> ${userDetails.referrer}</p>
        <p><strong>Payment Status:</strong> ${userDetails.paymentStatus}</p>
        ${paymentLink}
        <p><strong>Referral ID:</strong> ${userDetails.referralId || 'Not Available'}</p>
        <p><strong>Number of Referrals:</strong> ${userDetails.referralTree.length}</p>
    `;

    // Add the button only once
    if (!document.getElementById('show-referrals')) {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-info');
        button.id = 'show-referrals';
        button.innerText = 'Show Referral Details';
        button.onclick = toggleReferralDetails;
        userDetailsDiv.appendChild(button);
    }
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => messageContainer.innerHTML = '', 5000); // Clear message after 5 seconds
}

function displayReferralTree(referralTree) {
    const referralDetailsDiv = document.getElementById('referral-details');
    referralDetailsDiv.innerHTML = ''; // Clear previous content

    if (referralTree && referralTree.length > 0) {
        const list = document.createElement('ul');
        list.classList.add('referral-tree');

        referralTree.forEach(referral => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>${referral.fullName} - ${referral.paymentStatus}</span>`;
            if (referral.referrals && referral.referrals.length > 0) {
                const subList = document.createElement('ul');
                displayReferralTreeRecursive(subList, referral.referrals);
                listItem.appendChild(subList);
            }
            list.appendChild(listItem);
        });

        referralDetailsDiv.appendChild(list);
    } else {
        referralDetailsDiv.innerHTML = '<p>No referrals available.</p>';
    }
}

function displayReferralTreeRecursive(container, referralTree) {
    referralTree.forEach(referral => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${referral.fullName} - ${referral.paymentStatus}</span>`;
        if (referral.referrals && referral.referrals.length > 0) {
            const subList = document.createElement('ul');
            displayReferralTreeRecursive(subList, referral.referrals);
            listItem.appendChild(subList);
        }
        container.appendChild(listItem);
    });
}

function toggleReferralDetails() {
    if (globalUserDetails && globalUserDetails.referralTree) {
        displayReferralTree(globalUserDetails.referralTree);
        const referralDetailsDiv = document.getElementById('referral-details');
        referralDetailsDiv.style.display = (referralDetailsDiv.style.display === 'none' || referralDetailsDiv.style.display === '') ? 'block' : 'none';
    } else {
        showMessage('No referral details available.', 'error');
    }
}

// Placeholder for Contact Info Panel toggling
function toggleContactInfoPanel() {
    const panel = document.getElementById('contact-info-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}

// Close Contact Info Panel
function closeContactInfoPanel() {
    document.getElementById('contact-info-panel').style.display = 'none';
}
