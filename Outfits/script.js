// Outfits
function calculateTotal() {
    const prices = document.querySelectorAll('.price');
    let total = 0;

    prices.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) total += value;
    });

    document.getElementById('total').textContent = `Total Price: $${total.toFixed(2)}`;
}

function loadData() {
    console.log("got Here");
    document.getElementById("target").innerHTML="page loaded";
    let promiseObject = fetch("http://localhost:8080/datafile.json");
    promiseObject.then(
        result => result.json())
    .then(json_result => {
        console.log(json_result);
        let document_list = "<ul>";
        while (i < json_result.length) {
            document_list += "<li>" + json_result[i]["brand"] + "</li>";
            i++;
        }
        document_list += "</ul>";
        document.getElementById("target").innerHTML=document_list;
    });
}

// Outfit display

let clothingData = [];

async function loadData() {
  try {
    const response = await fetch("datafile.json"); // relative to /www
    clothingData = await response.json();
    console.log(clothingData)
    displayClothingList();
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
}

function displayClothingList() {
  const container = document.getElementById("clothingList");
  container.innerHTML = "";

  clothingData.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("clothing-item");
    div.innerHTML = `
      <p>${item.brand} (${item.type}) - $${item.cost.toFixed(2)}</p>
    `;
    div.onclick = () => showOutfits(item);
    container.appendChild(div);
  });
}

function showOutfits(selectedItem) {
  const resultsContainer = document.getElementById("outfitResults");
  resultsContainer.innerHTML = `<h3>Outfits with: ${selectedItem.brand} ${selectedItem.type}</h3>`;

  // Group by type for easier outfit building
  const shoes = clothingData.filter(i => i.type === "shoes");
  const pants = clothingData.filter(i => i.type === "pants");
  const shirts = clothingData.filter(i => i.type === "shirt");

  let matchingOutfits = [];

  if (selectedItem.type === "shirt") {
    pants.forEach(p => {
      shoes.forEach(s => {
        matchingOutfits.push([selectedItem, p, s]);
      });
    });
  } else if (selectedItem.type === "pants") {
    shirts.forEach(sh => {
      shoes.forEach(s => {
        matchingOutfits.push([sh, selectedItem, s]);
      });
    });
  } else if (selectedItem.type === "shoes") {
    shirts.forEach(sh => {
      pants.forEach(p => {
        matchingOutfits.push([sh, p, selectedItem]);
      });
    });
  }

  if (matchingOutfits.length === 0) {
    resultsContainer.innerHTML += "<p>No outfits found.</p>";
    return;
  }

  matchingOutfits.forEach(outfit => {
    const outfitDiv = document.createElement("div");
    outfitDiv.classList.add("outfit");
    outfitDiv.innerHTML = `<h4>Outfit</h4>`;
    
    outfit.forEach(item => {
      outfitDiv.innerHTML += `
        <div class="outfit-item">
          <img src="${item.img}" alt="${item.brand} ${item.type}" class="clothing-img">
          <p>${item.brand} ${item.type} - $${item.cost.toFixed(2)}</p>
        </div>
      `;
    });

    // total price for this outfit
    const total = outfit.reduce((sum, item) => sum + item.cost, 0);
    outfitDiv.innerHTML += `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;

    resultsContainer.appendChild(outfitDiv);
  });
}