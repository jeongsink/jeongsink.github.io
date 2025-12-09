/*

도어

*/
function select_door(select) {
  const door = select.value;
  const divisionSelect = document.getElementById("option_division");
  const colorSelect = document.getElementById("option_color");
  const ncSelect = document.getElementById("option_nc");

  divisionSelect.innerHTML = "<option value=''>선택하세요</option>";
  ncSelect.innerHTML = "<option value=''>선택하세요</option>";
  colorSelect.innerHTML = "<option value=''>선택하세요</option>";
  ncSelect.disabled = true;
  divisionSelect.disabled = false;

  if (door) {
    const divisions = ["유광", "무광"];
    divisions.forEach(function (division) {
      const option = document.createElement("option");
      option.value = division;
      option.textContent = division;
      divisionSelect.appendChild(option);
    });
  }

  if (door === "도장 NC디자인") {
    ncSelect.disabled = false;
    fetch("tbl_nc.json")
      .then((res) => res.json())
      .then((data) => {
        data.forEach((nc) => {
          const option = document.createElement("option");
          option.value = nc.item;
          option.textContent = nc.item;
          ncSelect.appendChild(option);
        });
      });
  }

  if (door === "한솔 우드 컬러(무광)" || door === "한솔 스페셜 컬러(무광)") {
    const option = document.createElement("option");
    option.value = "무광";
    option.textContent = "무광";
    divisionSelect.appendChild(option);

    divisionSelect.value = "무광";
    divisionSelect.disabled = true;
    updateColorOptions(divisionSelect);
  }
}

function updateColorOptions(select) {
  const division = select.value;
  const doorSelect = document.getElementById("option_door").value;
  const colorSelect = document.getElementById("option_color");

  if (!doorSelect || !division) {
    colorSelect.innerHTML = "<option value=''>선택하세요</option>";
    return;
  }

  fetch("tbl_door.json")
    .then((res) => res.json())
    .then((data) => {
      colorSelect.innerHTML = "<option value=''>선택하세요</option>";
      const matchedColors = data.filter((item) => item.color === doorSelect && item.type === division);
      matchedColors.forEach((color) => {
        const option = document.createElement("option");
        option.value = color.title;
        option.textContent = color.title;
        colorSelect.appendChild(option);
      });
    });
}

function adjustDoorWidth(delta) {
  const widthInput = document.getElementById("door_width");
  let width = parseInt(widthInput.value) || 0;

  if (delta > 0) {
    width += width >= 100 ? 100 : 10;
  } else {
    width -= width > 100 ? 100 : 10;
  }
  width = Math.max(0, Math.min(width, 1200));
  widthInput.value = width;
}

function adjustDoorHeight(delta) {
  const heightInput = document.getElementById("door_height");
  let height = parseInt(heightInput.value) || 0;

  height += delta * 100;
  height = Math.max(0, Math.min(height, 2440));
  heightInput.value = height;
}

function adjustDoorQuantity(delta) {
  const quantityInput = document.getElementById("quantity");
  let quantity = parseInt(quantityInput.value) || 0;

  quantity += delta;
  quantity = Math.max(1, quantity);
  quantityInput.value = quantity;
}

function handleShelfChange() {
  const disableTargets = ["shelf_5", "shelf_7", "shelf_8", "shelf_9"];
  const hingeInput = document.getElementById("door_hinges");

  const shouldDisable = disableTargets.some((id) => {
    const shelf = document.getElementById(id);
    return shelf && shelf.checked;
  });

  hingeInput.disabled = shouldDisable;

  if (shouldDisable) {
    hingeInput.value = "";
  }
}

function getUnitValue(units, value) {
  for (let unit of units) {
    if (value <= unit) return unit;
  }
  return 0;
}

function validateDoorInput(values) {
  if (!values.type) {
    alert("도어를 선택해주세요.");
    return false;
  }

  if (!values.color) {
    alert("색상을 선택해주세요.");
    return false;
  }

  if (!values.width || values.width < 0 || values.width > 1200) {
    alert("가로 수치를 확인해주세요. (최대 1200mm)");
    return false;
  }

  if (!values.height || values.height < 0 || values.height > 2440) {
    alert("세로 수치를 확인해주세요. (최대 2440mm)");
    return false;
  }

  const hingeInput = document.getElementById("door_hinges");
  if (!hingeInput.disabled && !values.hinges.trim()) {
    alert("경첩란을 확인해주세요.");
    return false;
  }

  if (!values.quantity || values.quantity < 1) {
    alert("수량을 선택해주세요.");
    return false;
  }

  if (!values.options || values.options.length === 0) {
    alert("도어 종류(후면도장, 상부장 등)를 선택해주세요.");
    return false;
  }

  return true;
}

async function addDoorToTable() {
  const values = {
    type: document.getElementById("option_door").value,
    division: document.getElementById("option_division").value,
    color: document.getElementById("option_color").value,
    ncDesign: document.getElementById("option_nc").value,
    width: parseInt(document.getElementById("door_width").value),
    height: parseInt(document.getElementById("door_height").value),
    hinges: document.getElementById("door_hinges").value,
    quantity: parseInt(document.getElementById("quantity").value),
    options: Array.from(document.querySelectorAll('input[name="shelf"]:checked')).map((cb) => cb.value),
  };

  if (!validateDoorInput(values)) {
    return;
  }

  const tableBody = document.querySelector("#table tbody");
  const newRow = tableBody.insertRow();

  const widthUnits = [199, 399, 499, 599, 699, 799, 899, 999, 1099, 1199, 1200];
  const heightUnits = [399, 499, 599, 699, 799, 899, 999, 1099, 1199, 1299, 1399, 1499, 1599, 1699, 1799, 1899, 1999, 2099, 2199, 2299, 2399, 2400];
  var unitWidth = getUnitValue(widthUnits, values.width);
  var unitHeight = getUnitValue(heightUnits, values.height);
  if (values.height == 2440) unitHeight = 2400; // temp

  const cell1 = newRow.insertCell();
  cell1.innerHTML = '<input type="checkbox">';
  cell1.classList.add("text-center");

  const cell2 = newRow.insertCell();
  cell2.textContent = `${values.type} ${values.color} ${values.ncDesign} ${values.options.join(", ")}`;
  cell2.classList.add("text-center");

  const cell3 = newRow.insertCell();
  cell3.textContent = `18 X ${values.width} X ${values.height}`;
  cell3.classList.add("text-center");

  const cell4 = newRow.insertCell();
  cell4.textContent = values.hinges;
  cell4.classList.add("text-center");

  const cell5 = newRow.insertCell();
  cell5.textContent = values.quantity;
  cell5.classList.add("text-center");

  const cell6 = newRow.insertCell();
  cell6.classList.add("text-center");

  try {
    const response = await fetch("tbl_price.json");
    const priceData = await response.json();
    const match = priceData.find((item) => item["구분"] === values.type && item["가로"] === unitWidth && item["세로"] === unitHeight);
    if (match) {
      let totalPrice = match["가격"] * values.quantity;
      const hasBackPaint = values.options.includes("후면도장");
      const nc = values.ncDesign;
      const isHighNC = nc === "킹덤" || nc === "웨인스";
      const isMidNC = nc === "(21T)미란다" || nc === "(21T)그랑디아";

      if (values.division === "무광") {
        totalPrice *= 1.2;
      } else if (values.division === "유광") {
        totalPrice *= 1.3;
      }

      if (hasBackPaint && (isHighNC || isMidNC)) {
        if (isHighNC) {
          totalPrice *= 1.5;
        } else if (isMidNC) {
          totalPrice *= 1.45;
        }
      } else if (hasBackPaint) {
        totalPrice *= 1.2;
      } else if (isHighNC) {
        totalPrice *= 1.3;
      } else if (isMidNC) {
        totalPrice *= 1.25;
      }

      cell6.textContent = totalPrice.toLocaleString();
      showToast("도어를 담았습니다!");
    } else {
      cell6.textContent = "가격 없음";
      cell6.style.color = "red";
    }
  } catch (error) {
    alert("도어 담기에 실패했습니다. 관리자에게 문의해주세요.");
    cell6.textContent = "가격 계산 실패";
    cell6.style.color = "red";
  }

  calculateTotalPrice();
}

/*

F바

*/
function selectFbar() {
  const fbarSelect = document.getElementById("option_fbar");
  fetch("tbl_fbar.json")
    .then((res) => res.json())
    .then((data) => {
      fbarSelect.innerHTML = "<option value=''>선택하세요</option>";
      data.forEach((fbar) => {
        const option = document.createElement("option");
        option.value = fbar.color;
        option.textContent = fbar.color;
        fbarSelect.appendChild(option);
      });
    });
}

function adjustFbarWidth(delta) {
  const widthInput = document.getElementById("fbarWidth");
  let width = parseInt(widthInput.value) || 0;

  width += delta * 50;
  width = Math.max(100, Math.min(width, 2400));
  widthInput.value = width;
}

function adjustFbarQuantity(delta) {
  const quantityInput = document.getElementById("fbarQuantity");
  let quantity = parseInt(quantityInput.value) || 0;

  quantity += delta;
  quantity = Math.max(1, quantity);
  quantityInput.value = quantity;
}

function validateFbarInput(fbarColor, fbarWidth, fbarQuantity) {
  if (!fbarColor) {
    alert("색상을 선택해주세요.");
    return false;
  }

  if (!fbarWidth || fbarWidth < 100 || fbarWidth > 2400) {
    alert("길이를 확인해주세요. (최소 100mm ~ 최대 2400mm)");
    return false;
  }

  if (!fbarQuantity || fbarQuantity < 1) {
    alert("수량을 확인해주세요.");
    return false;
  }
  return true;
}

function addFbarToTable() {
  const fbarColor = document.getElementById("option_fbar").value;
  const fbarWidth = parseInt(document.getElementById("fbarWidth").value);
  const fbarQuantity = parseInt(document.getElementById("fbarQuantity").value);

  if (!validateFbarInput(fbarColor, fbarWidth, fbarQuantity)) {
    return;
  }

  const tableBody = document.querySelector("#table tbody");
  const newRow = tableBody.insertRow();

  const cell1 = newRow.insertCell();
  cell1.innerHTML = '<input type="checkbox">';
  cell1.classList.add("text-center");

  const cell2 = newRow.insertCell();
  cell2.textContent = `F바 ${fbarColor}`;
  cell2.classList.add("text-center");

  const cell3 = newRow.insertCell();
  cell3.textContent = `${fbarWidth} mm`;
  cell3.classList.add("text-center");

  const cell4 = newRow.insertCell();
  cell4.textContent = "-";
  cell4.classList.add("text-center");

  const cell5 = newRow.insertCell();
  cell5.textContent = fbarQuantity;
  cell5.classList.add("text-center");

  const pricePer100mm = 2000;
  const widthIn100Units = Math.floor(fbarWidth / 100);

  const cell6 = newRow.insertCell();
  cell6.classList.add("text-center");

  const totalPrice = widthIn100Units * pricePer100mm * fbarQuantity;
  cell6.textContent = totalPrice.toLocaleString();
  showToast("F바를 담았습니다!");
  calculateTotalPrice();
}

/*

부자재

*/
let materialData = [];

function getMaterialData() {
  const materialSelect = document.getElementById("option_material");
  fetch("tbl_material.json")
    .then((res) => res.json())
    .then((data) => {
      materialData = data;
      materialData.forEach((material) => {
        const option = document.createElement("option");
        option.value = material.item;
        option.textContent = material.item;
        materialSelect.appendChild(option);
      });
    });
}

function handleMaterialChange(selectElement) {
  const materialWidthInput = document.getElementById("materialWidth");

  if (selectElement.value === "2구 손잡이 홀타공(도어개수로주문)") {
    materialWidthInput.disabled = false;
  } else {
    materialWidthInput.disabled = true;
    materialWidthInput.value = ""; // 필요시 초기화
  }
}

function adjustMaterialQuantity(delta) {
  const quantityInput = document.getElementById("materialQuantity");
  let quantity = parseInt(quantityInput.value) || 0;

  quantity += delta;
  quantity = Math.max(1, quantity);
  quantityInput.value = quantity;
}

function adjustMaterialQuantity(delta) {
  const quantityInput = document.getElementById("materialQuantity");
  let quantity = parseInt(quantityInput.value) || 0;

  quantity += delta;
  quantity = Math.max(1, quantity);
  quantityInput.value = quantity;
}

function validateMaterialInput(materialType, materialQuantity, materialWidth) {
  if (!materialType) {
    alert("종류를 선택해주세요.");
    return false;
  }

  if (!materialQuantity || materialQuantity < 1) {
    alert("수량을 확인해주세요.");
    return false;
  }

  if (materialType === "2구 손잡이 홀타공(도어개수로주문)" && !materialWidth) {
    alert("길이를 확인해주세요.");
    return false;
  }

  return true;
}

function addMaterialToTable() {
  const materialType = document.getElementById("option_material").value;
  const materialQuantity = parseInt(document.getElementById("materialQuantity").value);
  const materialWidth = document.getElementById("materialWidth").value;

  if (!validateMaterialInput(materialType, materialQuantity, materialWidth)) {
    return;
  }
  const material = materialData.find((item) => item.item === materialType);
  const tableBody = document.querySelector("#table tbody");
  const newRow = tableBody.insertRow();

  const cell1 = newRow.insertCell();
  cell1.innerHTML = '<input type="checkbox">';
  cell1.classList.add("text-center");

  const cell2 = newRow.insertCell();
  cell2.textContent = materialType;
  cell2.classList.add("text-center");

  const cell3 = newRow.insertCell();
  if (materialWidth) {
    cell3.textContent = materialWidth;
  } else {
    cell3.textContent = "-";
  }
  cell3.classList.add("text-center");

  const cell4 = newRow.insertCell();
  cell4.textContent = "-";
  cell4.classList.add("text-center");

  const cell5 = newRow.insertCell();
  cell5.textContent = materialQuantity;
  cell5.classList.add("text-center");

  const cell6 = newRow.insertCell();
  cell6.classList.add("text-center");

  if (material) {
    const totalPrice = material.price * materialQuantity;
    cell6.textContent = totalPrice.toLocaleString();
  } else {
    cell6.textContent = "가격 정보 없음";
    cell6.style.color = "red";
  }
  showToast("부자재를 담았습니다!");

  calculateTotalPrice();
}

/*

주문표

*/
function deleteSelectedRows() {
  const checkboxes = document.querySelectorAll('#table tbody input[type="checkbox"]:checked');
  checkboxes.forEach((checkbox) => {
    checkbox.closest("tr").remove();
  });
  calculateTotalPrice();
}

function deleteAllRows() {
  const tableBody = document.querySelector("#table tbody");
  tableBody.innerHTML = "";
  calculateTotalPrice();
}

function calculateTotalPrice() {
  const priceCells = document.querySelectorAll("#table tbody td:nth-child(6)");
  let totalPrice = 0;

  priceCells.forEach((cell) => {
    const priceText = cell.textContent.replace(/[^0-9]/g, "");
    if (priceText) {
      totalPrice += parseInt(priceText);
    }
  });

  const totalPriceElement = document.getElementById("totalPrice");
  if (!totalPriceElement) {
    const tableContainer = document.querySelector(".table-responsive");
    const newTotalPriceElement = document.createElement("p");
    newTotalPriceElement.id = "totalPrice";
    newTotalPriceElement.style.textAlign = "right";
    tableContainer.parentNode.insertBefore(newTotalPriceElement, tableContainer.nextSibling);
  }

  document.getElementById("totalPrice").textContent = "총 견적 금액: " + totalPrice.toLocaleString() + "원";

  const unit10000 = Math.floor(totalPrice / 10000);
  const unit1000 = Math.floor((totalPrice % 10000) / 1000);
  const unit100 = Math.floor((totalPrice % 1000) / 100);

  document.getElementById("unit10000").textContent = `10,000원 단위 ${unit10000}개`;
  document.getElementById("unit1000").textContent = `1,000원 단위 ${unit1000}개`;
  document.getElementById("unit100").textContent = `100원 단위 ${unit100}개`;
}

function validateOrderInfo({ customerName, customerContact, customerEmail, tableData }) {
  if (!customerName || customerName.trim() === "") {
    alert("주문자명을 입력해주세요.");
    return false;
  }

  if (!customerContact || customerContact.trim() === "") {
    alert("연락처를 입력해주세요.");
    return false;
  }

  if (!tableData || tableData.length === 0) {
    alert("주문서에 담긴 항목이 없습니다.");
    return false;
  }

  if (customerEmail && customerEmail.trim() !== "") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(customerEmail.trim())) {
      alert("이메일 형식이 올바르지 않습니다.");
      return false;
    }
  }
  return true;
}

async function sendOrderEmail() {
  const customerName = document.getElementById("customerName").value;
  const customerContact = document.getElementById("customerContact").value;
  const customerEmail = document.getElementById("customerEmail").value;
  const customerRequirements = document.getElementById("customerRequirements").value;
  const totalPrice = document.getElementById("totalPrice").textContent.replace(/[^0-9]/g, "") || 0;

  const tableRows = document.querySelectorAll("#table tbody tr");
  const tableData = Array.from(tableRows).map((row) => {
    const cells = row.querySelectorAll("td");
    return {
      product: cells[1]?.textContent || "",
      size: cells[2]?.textContent || "",
      hinges: cells[3]?.textContent || "",
      quantity: cells[4]?.textContent || "",
      price: cells[5]?.textContent || "",
    };
  });

  const emailData = {
    customerName,
    customerContact,
    customerEmail,
    customerRequirements,
    totalPrice,
    tableData,
  };

  if (!validateOrderInfo(emailData)) {
    return;
  }

  try {
    await fetch("https://script.google.com/macros/s/AKfycbw8JDSzpDwfhyfeHN0dRgChdrPi7ywPXTMRp83MrUlVh5AEAFwbXFJgr7X2iF7n3s4cWQ/exec", {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });

    showToast("견적서가 전송되었습니다!");
  } catch (error) {
    console.error("이메일 전송 오류:", error);
    alert("이메일 전송 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  selectFbar();
  getMaterialData();
});

function showToast(message, duration = 2000) {
  const id = "toast_" + Date.now();

  Toastify({
    text: `${message}<div id="${id}_bar" style="margin-top: 10px; height: 4px; background: rgba(255,255,255,0.6); border-radius: 3px; transform: scaleX(1); transform-origin: left; transition: transform ${duration}ms linear;"></div>`,
    duration: duration,
    gravity: "bottom",
    position: "center",
    escapeMarkup: false,
    style: {
      width: "100%",
      maxWidth: "calc(100% - 40px)",
      background: "rgba(33, 150, 243, 0.85)",
      color: "#fff",
      borderRadius: "16px",
      padding: "16px 24px 10px 24px",
      fontSize: "15px",
      textAlign: "left",
      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
    },
    stopOnFocus: true,
    callback: () => {},
  }).showToast();

  setTimeout(() => {
    const bar = document.getElementById(`${id}_bar`);
    if (bar) bar.style.transform = "scaleX(0)";
  }, 10);
}
