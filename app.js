const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000; // 환경변수로 포트 관리
const productsFilePath = "src/db/products.json";
const hashtagsFilePath = "src/db/hashtags.json";
const productHashtagsFilePath = "src/db/productHashtags.json";
app.use(express.json());

const { readDB, writeDB } = require("./dbController.js");

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
    // 입력값 검증
    const { name, description, price, hashtagIds } = req.body;
    if (!name || !description || !price || !hashtagIds) {
      return res.status(400).send({ error: "모든 필드를 입력해야합니다." });
    }
    if (name.length > 15 || description.length > 50) {
      return res.status(400).send({ error: "글자수 제한을 초과했습니다." });
    }
    if (price > 100000) {
      return res.status(400).send({ error: "가격 범위를 초과했습니다." });
    }
    if (
      typeof name !== "string" &&
      typeof description !== "string" &&
      typeof price !== "number"
    ) {
      return res.status(400).send({ error: "잘못된 데이터 타입입니다." });
    }

    // 기존 상품 목록 읽기
    const productData = readDB(productsFilePath);
    const products = productData.products;

    const newProduct = {
      id: products.length + 1, // id 생성
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
    };

    // 새로운 상품 추가
    products.push(newProduct);

    // 변경된 상품 목록 파일에 저장
    writeDB(productsFilePath, { products: products });

    // 맵핑 데이터 불러오기
    const productHashtagsData = readDB(productHashtagsFilePath);
    const productHashtags = productHashtagsData.productHashtags;

    const newProductHashtag = {
      productId: newProduct.id,
      hashtagIds: req.body.hashtagIds,
    };

    productHashtags.push(newProductHashtag);

    // 해시태그 데이터 가져오기
    const hashtagsData = readDB(hashtagsFilePath);
    const hashtags = hashtagsData.hashtags;

    // newProduct 객체에 해시태그 정보 추가
    newProduct.hashtags = newProductHashtag.hashtagIds.map((id) =>
      hashtags.find((h) => h.id === id)
    );
    writeDB(productHashtagsFilePath, { productHashtags: productHashtags });
    writeDB(productsFilePath, { products: products });
    res.status(201).json(newProduct);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "서버 내부 오류" });
  }
});

// 전체 상품 가져오기
app.get("/products", async (req, res) => {
  try {
    // 상품 데이터 로드
    const productData = readDB(productsFilePath);
    const products = productData.products;

    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "서버 내부 오류" });
  }
});

// 개별 상품 조회
app.get("/products/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    // 파일에서 상품 목록 읽기
    const productData = readDB(productsFilePath);
    const products = productData.products;

    // 특정 상품 찾기
    const product = products.find((product) => product.id === productId);

    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "서버 내부 오류" });
  }
});

// 상품 수정
app.put("/products/:id", async (req, res) => {
  try {
    // 입력값 검증
    const { name, description, price } = req.body;

    if (
      name === undefined &&
      description === undefined &&
      price === undefined
    ) {
      res.status(400).send({ error: "수정할 값을 1개라도 입력해주세요" });
    }

    if (
      (name && name.length > 15) ||
      (description && description.length > 50)
    ) {
      return res.status(400).send({ error: "글자수 제한을 초과했습니다." });
    }
    if (price > 100000) {
      return res.status(400).send({ error: "가격 범위를 초과했습니다." });
    }

    // 파일에서 상품 목록 읽기
    const productData = readDB(productsFilePath);
    const products = productData.products;

    //특정 상품 찾기
    const product = products.find(
      (product) => product.id === parseInt(req.params.id)
    );

    if (!product) {
      return res.status(404).send({ error: "상품 id를 찾을 수 없습니다." });
    }

    // 수정할 속성만 업데이트
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;

    writeDB(productsFilePath, { products: products });
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "서버 내부 오류" });
  }
});

// 상품 삭제
app.delete("/products/:id", async (req, res) => {
  try {
    const productData = readDB(productsFilePath);
    const products = productData.products;

    //특정 상품 찾기
    const product = products.find(
      (product) => product.id === parseInt(req.params.id)
    );

    if (!product) {
      return res.status(404).send({ error: "상품 id를 찾을 수 없습니다." });
    }

    const productIndex = products.indexOf(product);
    products.splice(productIndex, 1);

    writeDB(productsFilePath, { products: products });
    res.json({ message: "상품이 성공적으로 삭제되었습니다." });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "서버 내부 오류" });
  }
});

// 해시태그 등록
app.post("/hashtags", async (req, res) => {
  try {
    const { hashtag_name } = req.body;

    if (!hashtag_name) {
      return res.status(400).send({ error: "해시태그명을 입력하세요" });
    }
    if (hashtag_name.length > 15) {
      return res.status(400).send({ error: "글자수 제한을 초과했습니다." });
    }
    if (typeof hashtag_name !== "string") {
      return res.status(400).send({ error: "잘못된 데이터 타입입니다." });
    }

    // 기존 해시태그 목록 읽기
    const hashtagData = readDB(hashtagsFilePath);
    const hashtags = hashtagData.hashtags;

    const addedHashtag = {
      id: hashtags.length + 1, // id 생성
      hashtag_name: req.body.hashtag_name,
    };
    // 새로운 상품 추가
    hashtags.push(addedHashtag);

    // 변경된 상품 목록 파일에 저장
    writeDB(hashtagsFilePath, { hashtags: hashtags });
    res.status(201).json(addedHashtag);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "서버 내부 오류" });
  }
});

// 해시태그 수정
app.put("/hashtags/:id", async (req, res) => {
  try {
    const { hashtag_name } = req.body;

    if (!hashtag_name) {
      return res.status(400).send({ error: "해시태그명을 입력하세요" });
    }
    if (hashtag_name.length > 15) {
      return res.status(400).send({ error: "글자수 제한을 초과했습니다." });
    }

    console.log(typeof hashtag_name);
    if (typeof hashtag_name !== "string") {
      return res.status(400).send({ error: "잘못된 데이터 타입입니다." });
    }

    // 기존 해시태그 목록 읽기
    const hashtagData = readDB(hashtagsFilePath);
    const hashtags = hashtagData.hashtags; //json 파싱

    // 특정 해시태그 찾기
    const hashtag = hashtags.find(
      (hashtag) => hashtag.id === parseInt(req.params.id)
    );

    if (!hashtag) {
      return res.status(404).send({ error: "상품 id를 찾을 수 없습니다." });
    }

    hashtag.hashtag_name = req.body.hashtag_name;

    writeDB(hashtagsFilePath, { hashtags: hashtags });
    res.json(hashtag);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "서버 내부 오류" });
  }
});

// 해시태그 삭제
app.delete("/hashtags/:id", async (req, res) => {
  try {
    const hashtagData = readDB(hashtagsFilePath);
    const hashtags = hashtagData.hashtags;

    // 특정 해시태그 찾기
    const hashtag = hashtags.find(
      (hashtag) => hashtag.id === parseInt(req.params.id)
    );

    if (!hashtag) {
      return res.status(404).send({ error: "해시태그 id를 찾을 수 없습니다." });
    }

    const hashtagIndex = hashtags.indexOf(hashtag);
    hashtags.splice(hashtagIndex, 1);

    writeDB(hashtagsFilePath, { hashtags: hashtags });
    res.json({ message: "해시태그가 성공적으로 삭제되었습니다." });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "서버 내부 오류" });
  }
});
