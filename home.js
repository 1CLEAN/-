async function fetchAndProcessData() {
  const response = await fetch(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IHME-GBD_2021_DATA-9473a695-1-ERWspkumoqg5Bf5IhwRnCNA2BJsJFF.csv"
  );
  const data = await response.text();
  const rows = data.split("\n").slice(1); // 跳过标题行
  const processedData = {};

  rows.forEach((row) => {
    const columns = row.split(",");
    const country = columns[3]; // location_name
    const rate = Number.parseFloat(columns[13]); // val

    if (country && !isNaN(rate) && country !== "Antarctica") {
      processedData[country] = rate;
    }
  });

  return processedData;
}

async function createChoroplethMap() {
  const mapData = await fetchAndProcessData();

  const data = [
    {
      type: "choropleth",
      locationmode: "country names",
      locations: Object.keys(mapData),
      z: Object.values(mapData),
      text: Object.keys(mapData).map(
        (country) => `${country}: ${mapData[country].toFixed(2)}`
      ),
      colorscale: [
        [0, "rgb(190,201,203)"],
        [0.2, "rgb(164,214,239)"],
        [0.4, "rgb(204,220,194)"],
        [0.6, "rgb(254,204,167)"],
        [0.8, "rgb(255,195,196)"],
        [1, "rgb(255,159,163)"],
      ],
      autocolorscale: false,
      reversescale: false,
      marker: {
        line: {
          color: "rgb(180,180,180)",
          width: 0.5,
        },
      },
      tick0: 0,
      zmin: 0,
      dtick: 100,
      colorbar: {
        autotic: false,
        title: "骨关节炎发病率 (每10万人)",
      },
    },
  ];

  const layout = {
    title: "2021年全球骨关节炎发病率<br>(拖动或者悬停我试试(〃'▽'〃)）",
    geo: {
      showframe: false,
      showcoastlines: true,
      projection: {
        type: "mercator",
      },
      lataxis: {
        range: [-60, 90], // 去掉南极洲
      },
    },
    width: 800, // 调整地图大小
    height: 500,
  };

  await Plotly.newPlot("choroplethMap", data, layout, { responsive: true });
}

function animateMapEntry() {
  const mapElement = document.getElementById("choroplethMap");
  mapElement.style.opacity = "0";
  mapElement.style.transform = "translateX(-100%)";

  requestAnimationFrame(() => {
    mapElement.style.transition = "opacity 1s ease-out, transform 1s ease-out";
    mapElement.style.opacity = "1";
    mapElement.style.transform = "translateX(0)";
  });
}

async function initializeMap() {
  await createChoroplethMap();
  animateMapEntry();
}

document.addEventListener("DOMContentLoaded", initializeMap);
function animateNumber(element, target, duration) {
  let start = 0;
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsedTime = currentTime - startTime;
    if (elapsedTime > duration) {
      element.textContent = target.toFixed(4);
      return;
    }

    const progress = elapsedTime / duration;
    const current = target * progress;
    element.textContent = current.toFixed(4);

    requestAnimationFrame(updateNumber);
  }

  requestAnimationFrame(updateNumber);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetNumber = parseFloat(target.getAttribute("data-target"));
        animateNumber(target, targetNumber, 2000); // 2000ms = 2秒动画时长
        observer.unobserve(target);
      }
    });
  },
  {
    threshold: 0.1, // 当10%的元素可见时触发
  }
);

// 当 DOM 加载完成后开始观察目标元素
document.addEventListener("DOMContentLoaded", () => {
  const numberElement = document.querySelector(".number");
  observer.observe(numberElement);
});
