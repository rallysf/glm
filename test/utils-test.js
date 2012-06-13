var vows = require('vows'),
    assert = require('assert'),
    glm = require('../glm');

var suite = vows.describe('utils');

suite.addBatch({
  "checkConvergence": {
    topic: function () { return glm.GLM.utils.checkConvergence; },
    "returns true when optimization procedure has converged": function (checkConvergence) {
      assert.isTrue(checkConvergence(1, 1, 1, 100));
    },
    "returns true when number of iterations has overlapped maximum": function (checkConvergence) {
      assert.isTrue(checkConvergence(1, 20, 101, 100));
    },
    "returns false when number of iterations has not yet overlapped maximum and not yet overlapped maximum": function (checkConvergence) {
      assert.isFalse(checkConvergence(1, 2, 1, 1));
    }
  },
  "atleast_2d": {
    topic: function () { return glm.GLM.utils.atleast_2d; },
    "convert to 2d row vector": function (atleast_2d) {
      assert.deepEqual(atleast_2d([1, 2]), [[1, 2]]);
    }
  },
  "softThreshold": {
    topic: function () { return glm.GLM.utils.softThreshold; },
    "will threshold values below gamma": function (softThreshold) {
      assert.equal(softThreshold(3, 1), 2);
      assert.equal(softThreshold(0.1, 1), 0);
      assert.equal(softThreshold(-3, 1), -2);
    }
  },
  "mean": {
    topic: function () { return glm.GLM.utils.mean; },
    "correctly computes the average of an input vector": function (mean) {
      assert.equal(mean([1]), 1);
      assert.equal(mean([1, 2]), 1.5);
      assert.equal(mean([0, 2, 4]), 2);
      assert.equal(mean([0, -2, -4]), -2);
    }
  },
  "inverse": {
    topic: function () { return glm.GLM.utils.inverse; },
    "correctly calucates matrix inverse for valid matricies": function (inverse) {
      assert.deepEqual(inverse([[1]]), [[1]]);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(inverse([[1, 2], [3, 4]]), [[-2,  1], [1.5, -0.5]]));
    }
  },
  "dot": {
    topic: function () { return glm.GLM.utils.dot; },
    "correctly computes dot product for two vectors": function (dot) {
      assert.equal(dot([3], [2]), 6);
      assert.equal(dot([3, 7], [2, 5]), 41);
    }, 
    "dot product of vector to matrix": function (dot) {
      assert.deepEqual(dot([[2, 1], [5, 1], [1, 1]], [[3, 3, 1], [7, 3, 1]]), [[13, 9, 3], [22, 18, 6], [10, 6, 2]]);
      assert.deepEqual(dot([[3, 7]], [[2], [5]]), [[41]]);
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(dot([[-0.046473988494865254, -0.026631599099820213, -0.06981797601844764, -0.0001750799064268449, 0.017332910736259977, 0.018889176571165456, 0.027448638663145675, -0.00212041220005868, -0.005232943869869694, 0.017332910736259977, 0.017332910736259977, 0.06635528453578304, 0.03989876534238962, 0.043789429929653345, 0.1581749687952071, 0.1717144815588849, 0.16556723151100816, -0.0791555710278806, -0.12467634669886629, -0.10755742251490585, -0.058535048715382815, 0.02355797407588195, 0.016943844277533593, 0.04845822743436978, 0.04884729389309622, -0.0997760933403784, -0.08382436853259706, -0.1326133024568843, -0.003676678034964187, -0.03480199473307405, 0.027448638663145675, -0.03402386181562134 ], [ 0.22168722313380818, 0.15784929585259955, 0.29679066699405365, 0.07273205947765471, 0.016404476582470684, 0.011397580325120948, -0.016140349090302375, 0.07899067979934182, 0.08900447231404118, 0.016404476582470684, 0.016404476582470684, -0.14131275552404488, -0.05619551914910004, -0.06871275979247427, -0.43671963470767705, -0.4802796321466195, -0.460502391930088, 0.32683204453815173, 0.47328376006563044, 0.4182079012347838, 0.26049066912826835, -0.003623108446928258, 0.017656200646808062, -0.08373344856452325, -0.08498517262886074, 0.3931734199480353, 0.34185273331020083, 0.4988189309781139, 0.08399757605669145, 0.18413550120368538, -0.016140349090302375, 0.18163205307501062 ]], [ -1.0530633446377986, -1.0530633446377986, -1.0530633446377986, -1.0530633446377986, 1.0530633446377986, -1.0530633446377986, 1.0530633446377986, -1.0530633446377986, -1.0530633446377986, -1.0530633446377986, -1.0530633446377986, 1.0530633446377986, 1.0530633446377986, 1.0530633446377986, 1.0530633446377986, 1.0530633446377986, 1.0530633446377986, -1.0530633446377986, -1.0530633446377986, -1.0530633446377986, -1.0530633446377986, 1.0530633446377986, 1.0530633446377986, 1.0530633446377986, 1.0530633446377986, -1.0530633446377986, -1.0530633446377986, -1.0530633446377986, 1.0530633446377986, 1.0530633446377986, 1.0530633446377986, -1.0530633446377986]), [1.720829801676302, -5.688336280818169]));
      assert.ok(glm.GLM.testing.fuzzyArrayEqual(dot([[ -0.04761904761904756, -0.05050762722761048, -0.041239304942116056, -0.023809523809523767, 2.7755575615628914e-17, 0.02916059217599018, 0.06299407883487118], [0.27380952380952356, 0.303045763365663, 0.2680554821237545, 0.19047619047619035, 0.07985957062499249, -0.058321184351980304, -0.22047927592204908]], [1, 4.242640687119286, 6.928203230275509, 10, 4.47213595499958, 7.348469228349534, 10.583005244258363 ]), [0.09523809523809601, 2.9166666666666634]));
    }, 
    "matrix to matrix multiplication for two matricies": function (dot) {
      assert.deepEqual(dot([[2, 1], [5, 1]], [[3, 3], [7, 3]]), [[13, 9], [22, 18]]);
      assert.deepEqual(dot([[0.011904761904761892, -0.05952380952380945], [-0.059523809523809465, 0.33333333333333304 ]], [[1, 2.8284271247461903, 5.196152422706632, 8, 11.180339887498949, 14.696938456699067, 18.520259177452136 ], [ 1, 1.4142135623730951, 1.7320508075688772, 2, 2.23606797749979, 2.449489742783178, 2.6457513110645907 ]]), [[ -0.04761904761904756, -0.05050762722761048, -0.041239304942116056, -0.023809523809523767, 2.7755575615628914e-17, 0.02916059217599018, 0.06299407883487118 ], [0.27380952380952356, 0.303045763365663, 0.2680554821237545, 0.19047619047619035, 0.07985957062499249, -0.058321184351980304, -0.22047927592204908 ]]);
    }
  },
  "transpose": {
    topic: function () { return glm.GLM.utils.transpose; },
    "transpose a 2x2 square matrix": function (transpose) {
      assert.deepEqual(transpose([[2, 3], [4, 5]]), [[2, 4], [3, 5]]);
    },
    "transpose a 2x3 non-square matrix": function (transpose) {
      assert.deepEqual(transpose([[2, 3, 7], [4, 5, 8]]), [[2, 4], [3, 5], [7, 8]]);
    },
    "transpose a 1-d vector into column vector (2-d)": function (transpose) {
      assert.deepEqual(transpose([1,2,3]), [[1], [2], [3]]);
    }
  }
});

suite.export(module);
