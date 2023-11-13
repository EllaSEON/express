const express = require("express");
const fs = require("fs").promises;
const app = express();
const PORT = process.env.PORT || 3000; // 환경변수로 포트 관리
const productsFilePath = "src/db/product.json";
app.use(express.json());

app.get("/", (req, res) => {
  res.send("서버 잘 작동됨!");
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 상품 업로드
app.post("/products", async (req, res) => {
  try {
    // 기존 상품 목록 읽기
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data).products; //json 파싱

    const addedProduct = {
      id: products.length + 1,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
    };

    // 새로운 상품 추가
    products.push(addedProduct);

    // 변경된 상품 목록 파일에 저장
    await fs.writeFile(productsFilePath, JSON.stringify({ products }));
    res.status(201).json(addedProduct);
  } catch (err) {
    console.log(err);
  }
});

// 전체 상품 가져오기
app.get("/products", async (req, res) => {
  try {
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data); //json 파싱
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).send("서버 내부 에러");
  }
});

// 개별 상품 조회
app.get("/products/:id", async (req, res) => {
  try {
    // 파일에서 상품 목록 읽기
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data).products; // json 파싱

    //특정 상품 찾기
    const product = products.find(
      (product) => product.id === parseInt(req.params.id)
    );
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "서버 내부 오류" });
  }
});

// 상품 수정
app.put("/products/:id", async (req, res) => {
  try {
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data).products; // json 파싱
    //특정 상품 찾기
    const product = products.find(
      (product) => product.id === parseInt(req.params.id)
    );

    if (!product) {
      return res.status(404).send({ error: "상품 id를 찾을 수 없습니다." });
    }
    product.name = req.body.name;
    product.description = req.body.description;
    product.price = req.body.price;
    await fs.writeFile(productsFilePath, JSON.stringify({ products }));
    res.json(products);
  } catch (err) {
    console.log(err);
  }
});

// 상품 삭제
app.delete("/products/:id", async (req, res) => {
  try {
    const data = await fs.readFile(productsFilePath, "utf8");
    const products = JSON.parse(data).products; // json 파싱
    //특정 상품 찾기
    const product = products.find(
      (product) => product.id === parseInt(req.params.id)
    );

    if (!product) {
      return res.status(404).send({ error: "상품 id를 찾을 수 없습니다." });
    }

    const productIndex = products.indexOf(product);
    products.splice(productIndex, 1);

    await fs.writeFile(productsFilePath, JSON.stringify({ products }));
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "서버 내부 오류" });
  }
});
