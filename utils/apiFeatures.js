class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const copyQuery = { ...this.queryString };

    const excludeItems = ['page', 'sort', 'limit', 'fields'];

    excludeItems.forEach((i) => delete copyQuery[i]);

    console.log('FILTER', copyQuery);

    //Advance Filtering to remove comparision operator
    let queryStr = JSON.stringify(copyQuery);

    queryStr = queryStr.replace(/\b(gt|lt|gte|lte)\b/g, (item) => `$${item}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString['sort']) {
      const sortBy = this.queryString['sort'].split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  projection() {
    if (this.queryString.fields) {
      const queryStr = this.queryString.fields.split(',').join(' ');
      // console.log(querStr);
      this.query = this.query.select(queryStr);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit1 = this.queryString.limit * 1 || 100;
    const skip = limit1 * (page - 1);

    this.query = this.query.skip(skip).limit(limit1);

    return this;
  }
}

module.exports = APIFeatures;
